import { create } from 'zustand';
import { DialogueAction } from '../types/dialogue';
import { DIALOGUE_TREE } from '../data/dialogueTree';

interface DialogueStore {
    // State
    currentNodeId: string | null;
    history: string[];
    visitedNodes: Set<string>;
    isOpen: boolean;
    hasVisitedBefore: boolean;

    // Actions
    startDialogue: () => void;
    goToNode: (nodeId: string) => void;
    goBack: () => void;
    selectOption: (optionIndex: number) => DialogueAction | undefined;
    close: () => void;
    reset: () => void;

    // Computed
    getCurrentNode: () => typeof DIALOGUE_TREE[string] | null;
}

export const useDialogueStore = create<DialogueStore>()((set, get) => ({
    currentNodeId: null,
    history: [],
    visitedNodes: new Set<string>(),
    isOpen: false,
    hasVisitedBefore: false,

    startDialogue: () => {
        const { hasVisitedBefore } = get();
        const startNode = hasVisitedBefore ? 'greeting_return' : 'greeting';
        set({
            currentNodeId: startNode,
            history: [],
            isOpen: true,
            visitedNodes: new Set<string>([startNode]),
        });
    },

    goToNode: (nodeId: string) => {
        const { currentNodeId, history, visitedNodes } = get();
        const newHistory = currentNodeId ? [...history, currentNodeId] : history;
        const newVisited = new Set(visitedNodes);
        newVisited.add(nodeId);
        set({
            currentNodeId: nodeId,
            history: newHistory,
            visitedNodes: newVisited,
        });
    },

    goBack: () => {
        const { history } = get();
        if (history.length === 0) return;
        const newHistory = [...history];
        const previousNodeId = newHistory.pop()!;
        set({
            currentNodeId: previousNodeId,
            history: newHistory,
        });
    },

    selectOption: (optionIndex: number) => {
        const { getCurrentNode } = get();
        const node = getCurrentNode();
        if (!node) return undefined;

        const option = node.options[optionIndex];
        if (!option) return undefined;

        if (option.nextNodeId === null) {
            // Konuşma kapanıyor
            get().close();
        } else {
            get().goToNode(option.nextNodeId);
        }

        return option.action;
    },

    close: () => {
        set({
            isOpen: false,
            currentNodeId: null,
            history: [],
            hasVisitedBefore: true,
        });
    },

    reset: () => {
        set({
            currentNodeId: null,
            history: [],
            visitedNodes: new Set<string>(),
            isOpen: false,
            hasVisitedBefore: false,
        });
    },

    getCurrentNode: () => {
        const { currentNodeId } = get();
        if (!currentNodeId) return null;
        return DIALOGUE_TREE[currentNodeId] || null;
    },
}));
