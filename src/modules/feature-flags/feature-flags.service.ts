export interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description?: string;
  enabled: boolean;
  global: boolean;
}

const MOCK_FLAGS: FeatureFlag[] = [
  { id: 'f_1', key: 'ai_assistant', label: 'AI Assistant', description: 'Enable AI assistant for organizations', enabled: true, global: false },
  { id: 'f_2', key: 'advanced_analytics', label: 'Advanced Analytics', description: 'Unlock advanced analytics dashboard', enabled: false, global: true },
];

export const FeatureFlagsService = {
  async list() {
    return MOCK_FLAGS;
  },
  async get(id: string) {
    return MOCK_FLAGS.find((f) => f.id === id) ?? null;
  },
};
