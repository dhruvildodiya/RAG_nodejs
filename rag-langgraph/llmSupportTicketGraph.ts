import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Initialize LLM with support for OpenRouter or direct OpenAI API Key
const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const isOpenRouter = Boolean(
  process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY?.startsWith("sk-or-")
);

export const model = new ChatOpenAI({
  modelName: isOpenRouter
    ? process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini"
    : "gpt-4o-mini",
  apiKey: apiKey,
  temperature: 0.2,
  configuration: isOpenRouter
    ? {
        baseURL: "https://openrouter.ai/api/v1",
        defaultHeaders: {
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "LangGraph Support Ticket LLM",
        },
      }
    : undefined,
});

/**
 * ============================================================================
 * CONCEPT 1: STATE (Shared Memory Schema)
 * ============================================================================
 * The State defines the structure of data passed through the LangGraph workflow.
 * Now extended to store LLM classification reasoning alongside priority & response.
 */
export const TicketStateAnnotation = Annotation.Root({
  customerName: Annotation<string>(),
  issue: Annotation<string>(),
  priority: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "Unclassified",
  }),
  assignedDepartment: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "Pending Assignment",
  }),
  routingKey: Annotation<"billing" | "technical" | "general">({
    reducer: (x, y) => y ?? x,
    default: () => "general",
  }),
  reasoning: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
  response: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => "",
  }),
});

export type TicketState = typeof TicketStateAnnotation.State;

/**
 * Helper function to print state snapshots before and after node execution.
 */
function logNodeExecution(
  nodeName: string,
  stateBefore: TicketState,
  partialStateReturned: Partial<TicketState>
) {
  console.log(`\n--------------------------------------------------`);
  console.log(`🤖 [LLM NODE RUNNING]: ${nodeName}`);
  console.log(`📥 State BEFORE Node Execution:`);
  console.log(JSON.stringify(stateBefore, null, 2));
  console.log(`\n📤 Partial Update RETURNED by Node:`);
  console.log(JSON.stringify(partialStateReturned, null, 2));
  console.log(`--------------------------------------------------`);
}

/**
 * ============================================================================
 * CONCEPT 2: LLM STRUCTURED OUTPUT SCHEMA
 * ============================================================================
 * Using Zod schema to enforce structured responses from the LLM for ticket
 * classification, priority assessment, and department routing.
 */
const ticketClassificationSchema = z.object({
  priority: z
    .enum(["Low", "Medium", "High", "Critical"])
    .describe("Assessed priority level of the support ticket based on urgency and business impact"),
  department: z
    .enum(["billing", "technical", "general"])
    .describe("Target department responsible for handling this issue"),
  reasoning: z
    .string()
    .describe("Brief explanation for why this priority and department were chosen by the LLM"),
});

/**
 * ============================================================================
 * CONCEPT 3: NODES WITH LLM INTELLIGENCE
 * ============================================================================
 */

// Node 1: Classify Issue & Decide Routing using LLM
async function classifyIssueLLMNode(state: TicketState): Promise<Partial<TicketState>> {
  const structuredLlm = model.withStructuredOutput(ticketClassificationSchema);

  const prompt = `Analyze the following customer support ticket and classify it:
Customer Name: ${state.customerName}
Issue Description: "${state.issue}"

Instructions:
1. Determine the priority level: Low, Medium, High, or Critical.
2. Select the target department: 'billing', 'technical', or 'general'.
   - 'billing': Payments, subscriptions, invoices, charges, refunds.
   - 'technical': Bugs, error codes, crashes, login failures, system outages.
   - 'general': Account inquiries, feature requests, store hours, general questions.
3. Provide concise reasoning for your decision.`;

  const classification = await structuredLlm.invoke(prompt);

  const update: Partial<TicketState> = {
    priority: classification.priority,
    routingKey: classification.department,
    reasoning: classification.reasoning,
  };

  logNodeExecution("Classify Issue (LLM Driven)", state, update);
  return update;
}

// Node 2a: Assign Billing Department
function assignBillingNode(state: TicketState): Partial<TicketState> {
  const update = { assignedDepartment: "Billing Department" };
  logNodeExecution("Assign Department (Billing)", state, update);
  return update;
}

// Node 2b: Assign Technical Support Department
function assignTechnicalNode(state: TicketState): Partial<TicketState> {
  const update = { assignedDepartment: "Technical Support" };
  logNodeExecution("Assign Department (Technical)", state, update);
  return update;
}

// Node 2c: Assign General Support Department
function assignGeneralNode(state: TicketState): Partial<TicketState> {
  const update = { assignedDepartment: "General Support" };
  logNodeExecution("Assign Department (General)", state, update);
  return update;
}

// Node 3: Generate Response using LLM
async function generateResponseLLMNode(state: TicketState): Promise<Partial<TicketState>> {
  const messages = [
    new SystemMessage(
      `You are an empathetic, professional customer support representative working in the ${state.assignedDepartment}.
Write a direct, helpful, and concise response to the customer. Address them by name and address their exact concern.
Priority context: ${state.priority}.`
    ),
    new HumanMessage(
      `Customer Name: ${state.customerName}\nIssue: "${state.issue}"\nReasoning from triage: ${state.reasoning}`
    ),
  ];

  const response = await model.invoke(messages);
  const responseText = typeof response.content === "string" ? response.content : JSON.stringify(response.content);

  const update = { response: responseText };
  logNodeExecution("Generate Response (LLM Generated)", state, update);
  return update;
}

// Node 4: End Summary Node
function endSummaryNode(state: TicketState): Partial<TicketState> {
  console.log(`\n==================================================`);
  console.log(`📋 [LLM TICKET FINAL SUMMARY REPORT]`);
  console.log(`Customer:      ${state.customerName}`);
  console.log(`Issue:         "${state.issue}"`);
  console.log(`LLM Priority:  ${state.priority}`);
  console.log(`Department:    ${state.assignedDepartment}`);
  console.log(`LLM Reasoning: ${state.reasoning}`);
  console.log(`\n💬 [LLM GENERATED RESPONSE]:`);
  console.log(`"${state.response}"`);
  console.log(`==================================================\n`);
  return {};
}

/**
 * ============================================================================
 * CONCEPT 4: CONDITIONAL ROUTER (LLM-Driven Decision)
 * ============================================================================
 * Instead of hardcoded string matching like `includes('payment')`, this router
 * uses the decision produced by the LLM classification node.
 */
function routeByLLMClassification(state: TicketState): "billing" | "technical" | "general" {
  return state.routingKey || "general";
}

/**
 * ============================================================================
 * CONCEPT 5: GRAPH CONSTRUCTION
 * ============================================================================
 */
const workflow = new StateGraph(TicketStateAnnotation)
  // 1. Add nodes
  .addNode("classifyIssueLLM", classifyIssueLLMNode)
  .addNode("assignBilling", assignBillingNode)
  .addNode("assignTechnical", assignTechnicalNode)
  .addNode("assignGeneral", assignGeneralNode)
  .addNode("generateResponseLLM", generateResponseLLMNode)
  .addNode("endSummary", endSummaryNode)

  // 2. Entry point: START -> classifyIssueLLM
  .addEdge(START, "classifyIssueLLM")

  // 3. LLM-based Conditional Edge
  .addConditionalEdges("classifyIssueLLM", routeByLLMClassification, {
    billing: "assignBilling",
    technical: "assignTechnical",
    general: "assignGeneral",
  })

  // 4. Edges from department assignment to LLM response generator
  .addEdge("assignBilling", "generateResponseLLM")
  .addEdge("assignTechnical", "generateResponseLLM")
  .addEdge("assignGeneral", "generateResponseLLM")

  // 5. Final output steps
  .addEdge("generateResponseLLM", "endSummary")
  .addEdge("endSummary", END);

// Compile the executable graph application
const app = workflow.compile();

/**
 * ============================================================================
 * DEMONSTRATION & TEST RUNS
 * ============================================================================
 */
async function runDemo() {
  if (!apiKey || apiKey === "your_openrouter_api_key_here") {
    console.warn("⚠️  Please set a valid OPENROUTER_API_KEY or OPENAI_API_KEY in .env before running this script.");
    return;
  }

  console.log(`\n==================================================`);
  console.log(`🚀 STARTING LLM-POWERED LANGGRAPH SUPPORT TICKET DEMO`);
  console.log(`==================================================`);

  // Sample 1: Complex payment issue requiring LLM reasoning
  console.log(`\n📍 [TEST CASE 1]: Complex Subscription & Double Charge Query`);
  const result1 = await app.invoke({
    customerName: "Alice Smith",
    issue: "I noticed two unauthorized debits of $49.99 on my account statement after upgrading my plan yesterday.",
  });
  console.log("🏁 Final State (Test 1):", JSON.stringify(result1, null, 2));

  // Sample 2: Nuanced technical issue without explicit keyword "login"
  console.log(`\n📍 [TEST CASE 2]: Nuanced Tech Bug (Authentication Token Expiry)`);
  const result2 = await app.invoke({
    customerName: "Bob Jones",
    issue: "Every time I submit a report, the screen flashes red with status code 401 Unauthorized and dumps me back to home.",
  });
  console.log("🏁 Final State (Test 2):", JSON.stringify(result2, null, 2));

  // Sample 3: General Inquiry
  console.log(`\n📍 [TEST CASE 3]: Feature & Schedule Inquiry`);
  const result3 = await app.invoke({
    customerName: "Charlie Brown",
    issue: "Could you tell me if your platform supports export to PDF, and what your weekend support hours are?",
  });
  console.log("🏁 Final State (Test 3):", JSON.stringify(result3, null, 2));
}

runDemo().catch(console.error);
