import { Annotation, StateGraph, START, END } from "@langchain/langgraph";




/**
 * ============================================================================
 * CONCEPT 1: STATE (Shared Memory Schema)
 * ============================================================================
 * The State defines the shape of data passed through the entire graph.
 * LangGraph automatically manages state transitions and passes the current
 * state object to every node function.
 * 
 * Note: By default, fields without custom reducers use an "overwrite" pattern,
 * meaning returning `{ fieldName: newValue }` updates only that field in the state.
 */
export const TicketStateAnnotation = Annotation.Root({
  customerName: Annotation<string>(),
  issue: Annotation<string>(),
  priority: Annotation<string>(),
  assignedDepartment: Annotation<string>(),
  response: Annotation<string>(),
});

// Extract the TypeScript type representing our State shape
export type TicketState = typeof TicketStateAnnotation.State;

/**
 * Helper function to print state snapshots before and after a node runs.
 */
function logNodeExecution(
  nodeName: string,
  stateBefore: TicketState,
  partialStateReturned: Partial<TicketState>
) {
  console.log(`\n--------------------------------------------------`);
  console.log(`🔷 [NODE RUNNING]: ${nodeName}`);
  console.log(`📥 State BEFORE Node Execution:`);
  console.log(JSON.stringify(stateBefore, null, 2));
  console.log(`\n📤 Partial Update RETURNED by Node:`);
  console.log(JSON.stringify(partialStateReturned, null, 2));
  console.log(`--------------------------------------------------`);
}

/**
 * ============================================================================
 * CONCEPT 2: NODES (Single-Responsibility Action Functions)
 * ============================================================================
 * Each node in LangGraph is an async or sync function that receives the current State,
 * performs logic, and returns ONLY the fields it wants to update.
 * 
 * WHY RETURN ONLY MODIFIED FIELDS?
 * LangGraph uses partial updates. Returning `{ priority: "High" }` merges `priority`
 * into the main state without wiping out `customerName` or `issue`.
 */

// Node 1: Classify Issue (Determines Priority)
function classifyIssueNode(state: TicketState): Partial<TicketState> {
  const issueLower = state.issue.toLowerCase();
  let priority = "Low";

  if (issueLower.includes("payment") || issueLower.includes("urgent")) {
    priority = "High";
  } else if (issueLower.includes("login") || issueLower.includes("error")) {
    priority = "Medium";
  }

  const update = { priority };
  logNodeExecution("Classify Issue", state, update);
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

// Node 3: Generate Agent Response
function generateResponseNode(state: TicketState): Partial<TicketState> {
  let responseText = "";

  switch (state.assignedDepartment) {
    case "Billing Department":
      responseText = `Hello ${state.customerName}, our Billing team is investigating your payment issue.`;
      break;
    case "Technical Support":
      responseText = `Hello ${state.customerName}, our Tech Support team is addressing your login issue.`;
      break;
    default:
      responseText = `Hello ${state.customerName}, thank you for contacting General Support. We are reviewing your inquiry.`;
  }

  const update = { response: responseText };
  logNodeExecution("Generate Response", state, update);
  return update;
}

// Node 4: End Summary Node
function endSummaryNode(state: TicketState): Partial<TicketState> {
  console.log(`\n==================================================`);
  console.log(`📋 [TICKET FINAL SUMMARY REPORT]`);
  console.log(`Customer:   ${state.customerName}`);
  console.log(`Issue:      "${state.issue}"`);
  console.log(`Priority:   ${state.priority}`);
  console.log(`Department: ${state.assignedDepartment}`);
  console.log(`Response:   "${state.response}"`);
  console.log(`==================================================\n`);
  return {};
}

/**
 * ============================================================================
 * CONCEPT 4: CONDITIONAL EDGES (Dynamic Routing Logic)
 * ============================================================================
 * A conditional routing function inspects the current state and returns a string key.
 * LangGraph uses this key to decide which node to transition to next.
 * 
 * Rules:
 * - "payment" in issue  => "billing"
 * - "login" in issue    => "technical"
 * - Otherwise           => "general"
 */
function routeByIssueType(state: TicketState): "billing" | "technical" | "general" {
  const issueLower = state.issue.toLowerCase();
  if (issueLower.includes("payment")) {
    return "billing";
  } else if (issueLower.includes("login")) {
    return "technical";
  } else {
    return "general";
  }
}

/**
 * ============================================================================
 * CONCEPT 3: EDGES & GRAPH CONSTRUCTION
 * ============================================================================
 * `StateGraph` ties State, Nodes, Edges, and Conditional Edges together.
 * 
 * - `START`: Built-in entry point where execution begins when `invoke()` is called.
 * - `END`: Built-in exit point where execution terminates.
 * - `.addEdge(from, to)`: Static edge that always moves from node A to node B.
 * - `.addConditionalEdges(source, routerFn, targetMap)`: Dynamic routing edge.
 */
const workflow = new StateGraph(TicketStateAnnotation)
  // 1. Add all nodes to the graph
  .addNode("classifyIssue", classifyIssueNode)
  .addNode("assignBilling", assignBillingNode)
  .addNode("assignTechnical", assignTechnicalNode)
  .addNode("assignGeneral", assignGeneralNode)
  .addNode("generateResponse", generateResponseNode)
  .addNode("endSummary", endSummaryNode)

  // 2. Normal Edge: START -> classifyIssue
  .addEdge(START, "classifyIssue")

  // 3. Conditional Edge: classifyIssue -> routeByIssueType -> selected department node
  .addConditionalEdges("classifyIssue", routeByIssueType, {
    billing: "assignBilling",
    technical: "assignTechnical",
    general: "assignGeneral",
  })

  // 4. Normal Edges: All department nodes point to generateResponse
  .addEdge("assignBilling", "generateResponse")
  .addEdge("assignTechnical", "generateResponse")
  .addEdge("assignGeneral", "generateResponse")

  // 5. Normal Edges: generateResponse -> endSummary -> END
  .addEdge("generateResponse", "endSummary")
  .addEdge("endSummary", END);

/**
 * ============================================================================
 * COMPILE & INVOKE EXPLANATION
 * ============================================================================
 * - `compile()`: Validates the graph definition (ensures no dangling nodes/edges)
 *   and compiles it into a runnable application instance (`app`).
 * 
 * - `invoke(initialState)`: Starts graph execution at `START`. Passes `initialState`,
 *   runs nodes sequentially following edges, updates state automatically at each step,
 *   and returns the final updated State when it reaches `END`.
 */
const app = workflow.compile();

/**
 * ============================================================================
 * DEMONSTRATION & TEST RUNS
 * ============================================================================
 */
async function runDemo() {
  console.log(`\n==================================================`);
  console.log(`🚀 STARTING LANGGRAPH TICKET SYSTEM DEMO`);
  console.log(`==================================================`);

  // Sample 1: Payment Issue -> Billing Department Route
  console.log(`\n📍 [TEST CASE 1]: Payment Issue (Billing Route)`);
  const result1 = await app.invoke({
    customerName: "Alice Smith",
    issue: "My payment failed for order #1042",
  });
  console.log("🏁 Final State returned by invoke():", JSON.stringify(result1, null, 2));

  // Sample 2: Login Issue -> Technical Support Route
  console.log(`\n📍 [TEST CASE 2]: Login Issue (Technical Support Route)`);
  const result2 = await app.invoke({
    customerName: "Bob Jones",
    issue: "Unable to login to my account, getting error 403",
  });
  console.log("🏁 Final State returned by invoke():", JSON.stringify(result2, null, 2));

  // Sample 3: General Issue -> General Support Route
  console.log(`\n📍 [TEST CASE 3]: General Issue (General Support Route)`);
  const result3 = await app.invoke({
    customerName: "Charlie Brown",
    issue: "What are your business hours during holiday season?",
  });
  console.log("🏁 Final State returned by invoke():", JSON.stringify(result3, null, 2));
}

runDemo().catch(console.error);
