type OperationType = "SET" | "CLEAR";

export interface ValueChangeResponse {
  action: OperationType;
  fieldName: string;
  oldValue?: string;
  newValue?: string;
}
