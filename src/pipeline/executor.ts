export interface ExecutionContext { workflowId: string; runId: string; inputs: Record<string, any>; variables: Record<string, any>; logs: string[]; }
export class WorkflowExecutor { async execute(workflow: Workflow, inputs: Record<string, any>): Promise<ExecutionContext> {
  const ctx: ExecutionContext = { workflowId: workflow.id, runId: 'run-' + Date.now(), inputs, variables: { ...workflow.variables }, logs: [] };
  const startNodes = workflow.nodes.filter(n => !workflow.edges.some(e => e.target === n.id));
  for (const node of startNodes) { await this.executeNode(node, ctx, workflow); }
  return ctx;
}
  private async executeNode(node: WorkflowNode, ctx: ExecutionContext, workflow: Workflow): Promise<void> {
    ctx.logs.push('Executing ' + node.label);
    switch (node.type) {
      case 'http-request': { const resp = await fetch(node.config.url, { method: node.config.method || 'GET', headers: { 'Content-Type': 'application/json' }, body: node.config.body ? JSON.stringify(node.config.body) : undefined }); ctx.variables[node.id] = await resp.json(); break; }
      case 'transform': { ctx.variables[node.id] = node.config.code; break; }
      case 'condition': { const result = eval(node.config.expression); const nextEdges = workflow.edges.filter(e => e.source === node.id); for (const edge of nextEdges) { if (!edge.condition || eval(edge.condition) === result) { const nextNode = workflow.nodes.find(n => n.id === edge.target); if (nextNode) await this.executeNode(nextNode, ctx, workflow); } } return; }
    }
    const nextEdge = workflow.edges.find(e => e.source === node.id && !e.condition);
    if (nextEdge) { const nextNode = workflow.nodes.find(n => n.id === nextEdge.target); if (nextNode) await this.executeNode(nextNode, ctx, workflow); }
  }
}
