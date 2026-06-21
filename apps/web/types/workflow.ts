export interface Workflow {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  steps: WorkflowStep[];
  updatedAt: string;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  sequence: number;
  name: string;
  description?: string;
  triggerType: string;
  actionType: string;
  configuration: Record<string, any>;
  allowedDocumentTypes: DocumentType[];
  requiredPreviousSteps: WorkflowStep[];
}

export interface DocumentType {
  id: string;
  name: string;
  code: string;
}
