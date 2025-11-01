// State machine for simulation flow

export const SIM_STATES = {
  SCENARIO_SELECT: 'SCENARIO_SELECT',
  SCENARIO_SETUP: 'SCENARIO_SETUP',
  IN_SIM: 'IN_SIM',
  TIMEOUT: 'TIMEOUT',
  EXITED: 'EXITED',
  EVALUATED: 'EVALUATED',
  PROGRESS_VIEW: 'PROGRESS_VIEW'
};

export const SIDEBAR_TABS = {
  CONTEXT: 'context',
  RUBRIC: 'rubric',
  NOTES: 'notes'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system',
  COACHING: 'coaching'
};

