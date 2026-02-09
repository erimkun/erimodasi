// Dialogue system type definitions

export type DialogueAction =
    | { type: 'openProject'; boxId: string }
    | { type: 'highlightBox'; boxId: string }
    | { type: 'openTerminal' }
    | { type: 'openProfile' }
    | { type: 'closeBubble' };

export interface DialogueOption {
    label: string;
    nextNodeId: string | null; // null = konuşmayı kapat
    action?: DialogueAction;
}

export interface DialogueNode {
    id: string;
    message: string;
    options: DialogueOption[];
}

export type DialogueTree = Record<string, DialogueNode>;
