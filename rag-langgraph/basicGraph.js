import { Annotation, StateGraph, START, END } from "@langchain/langgraph";

// 1. Define State Annotation
const GraphAnnotation = Annotation.Root({
  name: Annotation(),
  greeting: Annotation(),
});

// 2. Create a node
async function greetingNode(state) {
  console.log("Current State:", state);

  return {
    greeting: `Hello ${state.name}! Welcome to LangGraph.`,
  };
}

// 3. Create the graph
const graph = new StateGraph(GraphAnnotation);

// 4. Register the node
graph.addNode("greet_node", greetingNode);

// 5. Connect START → greet_node
graph.addEdge(START, "greet_node");

// 6. Connect greet_node → END
graph.addEdge("greet_node", END);

// 7. Compile the graph
const app = graph.compile();

// 8. Execute the graph
const result = await app.invoke({
  name: "Dhruvil",
  greeting: "",
});

console.log("Result:", result);