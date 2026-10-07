/** Proposed domain contracts. Implementations and full game-rule compiler are not included. */
export type Id = string;
export type RoleId = string;
export type Alignment = 'good' | 'evil';
export interface TimePoint {
  phase: 'setup' | 'night' | 'day';
  cycle: number;
  step?: string; // A ruleset-defined resolution point; not a wall-clock timestamp.
}
export interface Visibility {
  scope: 'private' | 'shared';
  audienceIds: Id[];
}
export interface Game {
  id: Id;
  title: string;
  scriptId: 'trouble_brewing';
  rulesetHash: string;
  seatingPlayerIds: Id[]; // Ordered clockwise; validate uniqueness and player count.
  ownerPerspectiveId: Id;
  createdAt: string;
  profileId: string; // Explicitly declares supported setup and optional mechanisms.
}
export interface Player {
  id: Id;
  gameId: Id;
  seat: number;
  displayName: string;
  // No actual role: actual roles belong only to hidden-state witnesses.
}
export interface RawEntry {
  id: Id;
  gameId: Id;
  perspectiveId: Id;
  text: string;
  recordedAt: string;
  defaultGameTime?: TimePoint;
  visibility: Visibility;
}
export interface EffectInstance {
  id: Id;
  kind: 'poisoned' | 'drunk' | 'demon_protection';
  sourcePlayerId: Id;
  sourceAbilityInstanceId: Id;
  targetPlayerId: Id;
  startsAt: TimePoint;
  nominalEnd?: TimePoint;
  actualEnd?: TimePoint;
  lifecycleRuleId: string;
}
export interface Provenance {
  rawEntryId: Id;
  sourceSpans: Array<{ start: number; end: number }>;
  reporterId: Id;
  channel: 'direct' | 'hearsay' | 'self' | 'import';
  sourceEventIds: Id[];
}
export type Value = string | number | boolean | null;
export type Expr =
  | { op: 'eq'; field: 'actual_role' | 'shown_role' | 'alignment'; playerId: Id; at: TimePoint; value: string }
  | { op: 'report_accurate'; claimId: Id }
  | { op: 'ability_active'; playerId: Id; abilityId: string; at: TimePoint }
  | { op: 'poisoned'; playerId: Id; at: TimePoint }
  | { op: 'and' | 'or'; args: Expr[] }
  | { op: 'not'; arg: Expr };
export interface ObservationPayload {
  kind: 'token' | 'number' | 'yes_no' | 'player_pair_role' | 'character';
  value: Value;
  targetIds: Id[];
  abilityId?: string;
}
export interface Claim {
  id: Id;
  speakerId: Id;
  kind: 'role' | 'token' | 'ability_report' | 'action_report' | 'hearsay' | 'opinion';
  aboutTime?: TimePoint;
  content: ObservationPayload | Expr;
  provenance: Provenance;
  visibility: Visibility;
}
export type EventPayload =
  | { kind: 'claim_recorded'; claim: Claim }
  | { kind: 'self_observation_recorded'; observerId: Id; observation: ObservationPayload }
  | { kind: 'nomination_observed'; nominatorId: Id; nomineeId: Id }
  | { kind: 'vote_observed'; nominationId: Id; voterIds?: Id[]; total?: number;
      observations?: Array<{ voterId: Id; sequence: number; handRaised: boolean; at?: TimePoint }>;
      complete: boolean }
  | { kind: 'execution_observed'; playerId: Id; nominationId?: Id }
  | { kind: 'death_observed'; playerId: Id; announcedAt: TimePoint; occurredWithin?: [TimePoint, TimePoint] }
  | { kind: 'phase_closed'; at: TimePoint; completeChannels: string[] }
  | { kind: 'recording_corrected'; supersedesEventId: Id; replacement: EventPayload }
  | { kind: 'recording_retracted'; targetEventId: Id; reason: string }
  | { kind: 'note_saved'; noteId: Id; text: string };
export interface EventEnvelope {
  id: Id;
  gameId: Id;
  perspectiveId: Id;
  revision: number;
  recordedAt: string;
  occurredAt?: TimePoint;
  visibility: Visibility;
  provenance: Provenance;
  payload: EventPayload;
}
export interface Evidence {
  id: Id;
  kind: 'public_observation' | 'self_observation' | 'report' | 'behavior' | 'meta';
  sourceEventIds: Id[];
  dependentSourceGroupId?: Id;
  // Entry fidelity is not player honesty or probability of a role.
  entryFidelity: 'confirmed' | 'unconfirmed' | 'ambiguous';
  note?: string;
}
export interface Hypothesis {
  id: Id;
  expr: Expr;
  label: string;
  sourceClaimIds: Id[];
}
export interface Branch {
  id: Id;
  gameId: Id;
  parentBranchId?: Id;
  baseRevision: number;
  rulesetHash: string;
  assumptions: Hypothesis[];
  disabledAssumptionIds: Id[];
}
export interface RuleConstraint {
  id: Id;
  ruleId: string;
  ruleRevision: string;
  sourceEventIds: Id[];
  assumptionIds: Id[];
  compiledExpressionHash: string;
  layer: 'rule' | 'accepted_observation' | 'branch_assumption';
}
export interface HiddenSnapshot {
  at: TimePoint;
  players: Record<Id, {
    actualRole: RoleId;
    alignment: Alignment;
    alive: boolean;
    shownRole?: RoleId;
    poisonSourceIds: Id[];
    drunkennessSourceIds: Id[];
    abilityInstanceIds: Id[];
    spentAbilityIds: Id[];
  }>;
}
export interface WorldWitness {
  id: Id;
  branchId: Id;
  initial: HiddenSnapshot;
  trajectory: HiddenSnapshot[];
  effects: EffectInstance[];
  redHerringPlayerId?: Id;
  hiddenActions: Array<{ actorId: Id; at: TimePoint; abilityId: string; targets: Id[] }>;
  registrations: Array<{ interactionId: Id; targetId: Id; role?: RoleId; alignment?: Alignment }>;
  deliveredMessages: Array<{ recipientId: Id; at: TimePoint; payload: ObservationPayload }>;
  replayVerified: boolean;
}
export interface ResultEnvelope<T> {
  gameId: Id;
  perspectiveId: Id;
  revision: number;
  branchId: Id;
  rulesetHash: string;
  engineStatus: 'sat' | 'unsat' | 'unknown' | 'unsupported';
  semantics: 'exact' | 'overapproximation' | 'witness_sample';
  count?: { kind: 'exact' | 'lower_bound' | 'not_computed'; value?: string; projection: string[] };
  assumptionIds: Id[];
  evidenceIds: Id[];
  unsupportedMechanisms: string[];
  data: T;
}
export interface QueryContext {
  gameId: Id;
  perspectiveId: Id;
  revision: number;
  branchId: Id;
  rulesetHash: string;
  requestId: Id;
}
export interface CheckHypothesisInput extends QueryContext {
  hypothesis: Expr;
  timeoutMs: number;
  maxWitnesses: number;
}
