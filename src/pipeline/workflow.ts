export interface Workflow { id: string; name: string; description: string; nodes: WorkflowNode[]; edges: WorkflowEdge[]; triggers: Trigger[]; variables: Record<string, any>; }
export interface WorkflowNode { id: string; type: string; label: string; config: Record<string, any>; position: { x: number; y: number }; }
export interface WorkflowEdge { id: string; source: string; target: string; condition?: string; }
export interface Trigger { type: 'webhook' | 'schedule' | 'event'; config: Record<string, any>; }
export function createWorkflow(name: string, description: string): Workflow { return { id: 'wf-' + Date.now(), name, description, nodes: [], edges: [], triggers: [], variables: {} }; }
export function addNode(workflow: Workflow, node: WorkflowNode): Workflow { return { ...workflow, nodes: [...workflow.nodes, node] }; }
export function connectNodes(workflow: Workflow, sourceId: string, targetId: string, condition?: string): Workflow { const edge: WorkflowEdge = { id: 'edge-' + sourceId + '-' + targetId, source: sourceId, target: targetId, condition }; return { ...workflow, edges: [...workflow.edges, edge] }; }
