"""Independent finite Trouble Brewing acceptance oracle (Python standard library).

This module never imports or reads the application implementation. Information
possibilities use sets/cartesian products; dynamic fixtures use the official
ability timing. It covers the declared TB slice, not arbitrary scripts or every
possible history. Actual alignments persist through character changes.
"""
from copy import deepcopy
from itertools import product, permutations
import json
import sys

TOWNSFOLK = ('Washerwoman', 'Librarian', 'Investigator', 'Chef', 'Empath',
             'Fortune Teller', 'Undertaker', 'Monk', 'Ravenkeeper', 'Virgin',
             'Slayer', 'Soldier', 'Mayor')
OUTSIDERS = ('Butler', 'Drunk', 'Recluse', 'Saint')
MINIONS = ('Poisoner', 'Spy', 'Scarlet Woman', 'Baron')
ROLES = TOWNSFOLK + OUTSIDERS + MINIONS + ('Imp',)


def team(role):
    return ('townsfolk' if role in TOWNSFOLK else 'outsider' if role in OUTSIDERS
            else 'minion' if role in MINIONS else 'demon')


def evil(role):
    return role in MINIONS or role == 'Imp'


def alignments_for(roles):
    return ['evil' if evil(role) else 'good' for role in roles]


def registered_roles(role, disabled=False):
    extras = (TOWNSFOLK + OUTSIDERS if role == 'Spy' else
              MINIONS + ('Imp',) if role == 'Recluse' else ())
    return {role} | (set() if disabled else set(extras))


def registered_alignments(role, disabled=False, alignment=None):
    native = evil(role) if alignment is None else alignment == 'evil'
    return {native} | ({role == 'Recluse'} if role in ('Spy', 'Recluse') and not disabled else set())


def report_possibilities(roles, report, poison=None, alive=None, red_herring=None, alignments=None):
    """Existential registration per interaction, including each Chef edge.

    The active-ability premise constrains health/identity even when a message
    premise is absent. An inactive premise does not assert actual impairment.
    """
    kind = report['kind']
    ability = report.get('ability', {'librarian_zero': 'Librarian', 'chef': 'Chef',
                                    'empath': 'Empath', 'fortune_teller': 'Fortune Teller',
                                    'undertaker': 'Undertaker', 'ravenkeeper': 'Ravenkeeper'}.get(kind))
    speaker = report['speaker']
    if not report['abilityActive']:
        return True
    if roles[speaker - 1] != ability or speaker == poison:
        return False
    if not report['acceptedMessage']:
        return True
    if kind == 'librarian_zero':
        # Each player must be able to register outside the Outsider type.
        return all(any(r not in OUTSIDERS for r in registered_roles(role, seat == poison))
                   for seat, role in enumerate(roles, 1))
    if kind == 'pair_role':
        return any(report['seenRole'] in registered_roles(roles[s - 1], s == poison)
                   for s in report['targets'])
    if kind == 'chef':
        totals = {0}
        for left in range(1, len(roles) + 1):
            right = left % len(roles) + 1
            edge = {int(a and b) for a, b in product(
                registered_alignments(roles[left - 1], left == poison),
                registered_alignments(roles[right - 1], right == poison))}
            totals = {a + b for a, b in product(totals, edge)}
        return report['count'] in totals
    if kind == 'empath':
        living = [s for s in range(1, len(roles) + 1) if alive is None or alive[s - 1]]
        if speaker not in living or len(living) < 3:
            return False
        pos = living.index(speaker)
        neighbors = (living[pos - 1], living[(pos + 1) % len(living)])
        totals = {int(a) + int(b) for a, b in product(*(
            registered_alignments(roles[s - 1], s == poison,
                                  alignments[s - 1] if alignments else None) for s in neighbors))}
        return report['count'] in totals
    if kind == 'fortune_teller':
        herrings = ([red_herring] if red_herring is not None else
                    [s for s, r in enumerate(roles, 1)
                     if (alignments[s - 1] == 'good' if alignments else not evil(r))])
        return any(report['yes'] in {any(r == 'Imp' or s == h for s, r in zip(report['targets'], registered))
                                    for registered in product(*(
                                        registered_roles(roles[s - 1], s == poison)
                                        for s in report['targets']))} for h in herrings)
    raise ValueError(kind)


def fresh(roles, dead=(), **extra):
    state = dict(roles=list(roles), alive=[s not in dead for s in range(1, len(roles) + 1)],
                 alignments=alignments_for(roles), spentVirginSeats=[], spentSlayerSeats=[], spentDeadVotes=[])
    state.update(extra)
    return state


def role_seat(state, role):
    return next((s for s, r in enumerate(state['roles'], 1)
                 if r == role and state['alive'][s - 1]), None)


def night(before, actions):
    """Rule evaluation for valid slice inputs used by the generated matrix."""
    state = deepcopy(before)
    state.setdefault('alignments', alignments_for(state['roles']))
    count = sum(state['alive'])
    if state.get('winner') or count < 3 or not role_seat(state, 'Imp'):
        return dict(status='invalid')
    imps = [s for s, r in enumerate(state['roles'], 1) if r == 'Imp' and state['alive'][s - 1]]
    valid_seat = lambda s: type(s) is int and 1 <= s <= len(state['roles'])
    scarlet_choice = actions.get('scarletRecluseRegistration')
    if scarlet_choice is not None and (type(scarlet_choice) is not int or not 1 <= scarlet_choice <= len(state['roles'])):
        return dict(status='invalid')
    if actions['cycle'] == 1 and scarlet_choice is not None:
        return dict(status='invalid')
    changes = []
    poisoner = role_seat(state, 'Poisoner')
    if (poisoner and not valid_seat(actions.get('poisonerTarget'))
            or not poisoner and 'poisonerTarget' in actions):
        return dict(status='invalid')
    poison = actions.get('poisonerTarget') if poisoner else None
    # Single-source TB: the selected player's poison lasts to dusk, including
    # a self-target. Death or replacement of the source ends it earlier.
    healthy = lambda s: s != poison
    deaths = []
    steps = []
    rk_death = None
    rk_info = None
    protected = None
    if actions['cycle'] > 1:
        monk = role_seat(state, 'Monk')
        if (monk and (not valid_seat(actions.get('monkTarget')) or actions.get('monkTarget') == monk)
                or not monk and 'monkTarget' in actions):
            return dict(status='invalid')
        protected = actions.get('monkTarget') if monk and healthy(monk) else None
        if 'impActions' in actions:
            queue = actions['impActions']
            if (any(k in actions for k in ('impTarget', 'mayorRedirectTarget', 'impSuccessorSeat', 'scarletRecluseRegistration'))
                    or not isinstance(queue, list) or len(queue) != len(imps)
                    or any(not isinstance(a, dict) or a.get('actor') not in imps for a in queue)
                    or len({a['actor'] for a in queue}) != len(imps)):
                return dict(status='invalid')
        else:
            if len(imps) != 1:
                return dict(status='invalid')
            queue = [dict(actor=imps[0], target=actions.get('impTarget'), **{
                k: actions[k] for k in ('mayorRedirectTarget', 'impSuccessorSeat', 'scarletRecluseRegistration') if k in actions})]
        for attack in queue:
            actor = attack['actor']
            skip = 'game_over' if state.get('winner') else 'dead' if not state['alive'][actor - 1] else None
            if skip:
                if attack != dict(actor=actor, skipReason=skip):
                    return dict(status='invalid')
                steps.append(dict(actor=actor, target=None, deathSeat=None, skipReason=skip))
                continue
            target = attack.get('target')
            if not valid_seat(target) or 'skipReason' in attack:
                return dict(status='invalid')
            guarded = lambda s: s == protected or (state['roles'][s - 1] == 'Soldier' and healthy(s))
            redirect = attack.get('mayorRedirectTarget')
            if redirect is not None:
                if (not valid_seat(redirect) or state['roles'][target - 1] != 'Mayor'
                        or not state['alive'][target - 1] or not healthy(target)
                        or not healthy(actor) or guarded(target) or redirect == target):
                    return dict(status='invalid')
            victim = redirect if redirect is not None else target
            requested = attack.get('impSuccessorSeat')
            registration = attack.get('scarletRecluseRegistration')
            if any(s is not None and not valid_seat(s) for s in (requested, registration)):
                return dict(status='invalid')
            death = None
            used_successor = False
            used_registration = False
            if healthy(actor) and state['alive'][victim - 1] and not guarded(victim):
                count = sum(state['alive'])
                state['alive'][victim - 1] = False
                deaths.append(victim)
                death = victim
                sw = role_seat(state, 'Scarlet Woman')
                if (state['roles'][victim - 1] == 'Recluse' and healthy(victim)
                        and sw and healthy(sw) and count >= 5 and registration == victim):
                    state['roles'][sw - 1] = 'Imp'
                    used_registration = True
                    changes.append(dict(seat=sw, **{'from': 'Scarlet Woman'}, to='Imp', reason='scarlet_woman',
                                        registeredRecluseSeat=victim, sourceImpSeat=actor))
                if state['roles'][victim - 1] == 'Imp':
                    successor = sw if sw and healthy(sw) and count >= 5 else None
                    if successor and requested is not None and requested != successor:
                        return dict(status='invalid')
                    if successor is None and target == actor and victim == actor:
                        minions = [s for s, r in enumerate(state['roles'], 1) if state['alive'][s - 1]
                                   and (r in MINIONS or (r == 'Recluse' and healthy(s)))]
                        if minions:
                            if requested not in minions:
                                return dict(status='invalid')
                            successor = requested
                        elif requested is not None:
                            return dict(status='invalid')
                    if successor:
                        used_successor = True
                        old_role = state['roles'][successor - 1]
                        state['roles'][successor - 1] = 'Imp'
                        changes.append(dict(seat=successor, **{'from': old_role}, to='Imp', sourceImpSeat=actor,
                                            reason='scarlet_woman' if successor == sw and healthy(sw) and count >= 5 else 'imp_self_kill'))
            if requested is not None and not used_successor or registration is not None and not used_registration:
                return dict(status='invalid')
            if not role_seat(state, 'Imp'):
                state['winner'] = 'good'
            elif sum(state['alive']) <= 2:
                state['winner'] = 'evil'
            if poisoner and (not state['alive'][poisoner - 1] or state['roles'][poisoner - 1] != 'Poisoner'):
                poison = None
            if monk and (not state['alive'][monk - 1] or state['roles'][monk - 1] != 'Monk' or not healthy(monk)):
                protected = None
            if death is not None and before['roles'][death - 1] == 'Ravenkeeper':
                rk_death = dict(speaker=death, impActionIndex=len(steps), sourceImpSeat=actor,
                    poisonedSeat=poison, poisonSourceSeat=poisoner if poison is not None else None,
                    roles=list(state['roles']), gameOver=bool(state.get('winner')))
                if healthy(death) and not state.get('winner'):
                    learned_about = actions.get('ravenkeeperTarget')
                    if not valid_seat(learned_about):
                        return dict(status='invalid')
                    actual_at_death = state['roles'][learned_about - 1]
                    displayed = actions.get('ravenkeeperRegistrationRole', actual_at_death)
                    if ('ravenkeeperRegistrationRole' in actions and
                            (actual_at_death not in ('Spy', 'Recluse') or displayed == actual_at_death
                             or learned_about == poison or displayed not in registered_roles(actual_at_death))):
                        return dict(status='invalid')
                    rk_info = dict(speaker=death, target=learned_about, seenRole=displayed)
            steps.append(dict(actor=actor, target=target, deathSeat=death))
    elif any(k in actions for k in ('impActions', 'impTarget', 'impSuccessorSeat', 'mayorRedirectTarget')):
        return dict(status='invalid')
    if rk_info is None and any(k in actions for k in ('ravenkeeperTarget', 'ravenkeeperRegistrationRole')):
        return dict(status='invalid')
    ut_info = None
    if not state.get('winner'):
        ut = role_seat(state, 'Undertaker')
        if ut and ut != poison and actions['cycle'] > 1:
            if 'previousDayExecutionDeathSeat' not in actions:
                return dict(status='unsupported')
            executed = actions['previousDayExecutionDeathSeat']
            if executed is not None:
                if state['alive'][executed - 1]:
                    return dict(status='invalid')
                role = actions.get('undertakerRegistrationRole', state['roles'][executed - 1])
                if role not in registered_roles(state['roles'][executed - 1], executed == poison):
                    return dict(status='invalid')
                ut_info = dict(speaker=ut, executedSeat=executed, seenRole=role)
    master = actions.get('butlerMasterSeat') if role_seat(state, 'Butler') and not state.get('winner') else None
    expected = dict(
        state=state, deaths=deaths, poisonedAtInformationStep=poison,
        poisonSourceSeat=poisoner if poison is not None else None,
        protectedSeat=protected, butlerMasterSeat=master,
        ravenkeeperInfo=rk_info, ravenkeeperDeath=rk_death, undertakerInfo=ut_info, impSteps=steps)
    if changes:
        expected['roleChanges'] = changes
    return dict(status='ok', expected=expected)


def day(before, actions):
    state = deepcopy(before)
    state.setdefault('alignments', alignments_for(state['roles']))
    if state.get('winner') or sum(state['alive']) < 3 or not role_seat(state, 'Imp'):
        return dict(status='invalid')
    choices = actions.get('scarletRecluseRegistrations', [])
    if (not isinstance(choices, list) or len(set(choices)) != len(choices)
            or any(type(s) is not int or not 1 <= s <= len(state['roles']) for s in choices)):
        return dict(status='invalid')
    used_choices, changes = set(), []
    poison = actions.get('poisonedSeat')
    source = actions.get('poisonSourceSeat')
    healthy = lambda s: not (s == poison and source and state['alive'][source - 1]
                            and state['roles'][source - 1] == 'Poisoner')
    deaths, tallies = [], []
    executed = None
    execution_death, execution_cause, ended_index = None, None, None
    event_steps = []
    highest_votes, pending_execution = -1, None
    nominators, nominees = set(), set()

    def finish_event(index, death_offset):
        nonlocal ended_index
        step = dict(eventIndex=index, deaths=deaths[death_offset:], executedSeat=executed, aliveAfter=sum(state['alive']))
        if state.get('winner'):
            step['winner'] = state['winner']
        event_steps.append(step)
        if state.get('winner') or executed is not None:
            ended_index = index

    def kill(victim, execution=False):
        nonlocal execution_death
        count = sum(state['alive'])
        role = state['roles'][victim - 1]
        state['alive'][victim - 1] = False
        deaths.append(victim)
        if execution:
            execution_death = victim
        sw = role_seat(state, 'Scarlet Woman')
        registered = role == 'Recluse' and healthy(victim) and sw and healthy(sw) and count >= 5 and victim in choices
        if registered:
            used_choices.add(victim)
        if role == 'Saint' and healthy(victim) and execution:
            state['winner'] = 'evil'
        elif role == 'Imp' or registered:
            if count >= 5 and sw and healthy(sw):
                state['roles'][sw - 1] = 'Imp'
                if registered:
                    changes.append(dict(seat=sw, **{'from': 'Scarlet Woman'}, to='Imp', reason='scarlet_woman', registeredRecluseSeat=victim))
            elif not role_seat(state, 'Imp'):
                state['winner'] = 'good'
        if not state.get('winner') and sum(state['alive']) <= 2:
            state['winner'] = 'evil'

    for event_index, event in enumerate(actions['events']):
        if state.get('winner') or executed is not None:
            return dict(status='invalid')
        offset = len(deaths)
        if event['kind'] == 'slayer':
            actor, target = event['actor'], event['target']
            if not all(type(s) is int and 1 <= s <= len(state['roles']) for s in (actor, target)):
                return dict(status='invalid')
            if state['roles'][actor - 1] != 'Slayer' or not state['alive'][actor - 1]:
                if 'recluseRegistersDemon' in event:
                    return dict(status='invalid')
                finish_event(event_index, offset)
                continue
            if actor in state['spentSlayerSeats']:
                return dict(status='invalid')
            state['spentSlayerSeats'].append(actor)
            if healthy(actor) and state['alive'][target - 1]:
                role = state['roles'][target - 1]
                can_register = role == 'Recluse' and healthy(target)
                if can_register and 'recluseRegistersDemon' not in event:
                    return dict(status='unsupported')
                if not can_register and 'recluseRegistersDemon' in event:
                    return dict(status='invalid')
                if role == 'Imp' or (role == 'Recluse' and healthy(target) and event.get('recluseRegistersDemon')):
                    kill(target)
        elif event['kind'] == 'nomination':
            actor, target = event['nominator'], event['nominee']
            if (not all(type(s) is int and 1 <= s <= len(state['roles']) for s in (actor, target))
                    or not state['alive'][actor - 1] or actor in nominators or target in nominees):
                return dict(status='invalid')
            nominators.add(actor)
            nominees.add(target)
            if (not isinstance(event['votes'], list) or len(set(event['votes'])) != len(event['votes'])
                    or not all(type(s) is int and 1 <= s <= len(state['roles']) for s in event['votes'])):
                return dict(status='invalid')
            if (state['roles'][target - 1] == 'Virgin' and state['alive'][target - 1]
                    and target not in state['spentVirginSeats']):
                state['spentVirginSeats'].append(target)
                actual = state['roles'][actor - 1]
                spy_choice = actual == 'Spy' and healthy(actor) and healthy(target)
                if spy_choice and 'spyRegistersTownsfolk' not in event:
                    return dict(status='unsupported')
                if not spy_choice and 'spyRegistersTownsfolk' in event:
                    return dict(status='invalid')
                townsfolk = (event.get('spyRegistersTownsfolk', False) if actual == 'Spy' and healthy(actor)
                             else actual in TOWNSFOLK)
                if healthy(target) and townsfolk:
                    if event['votes']:
                        return dict(status='invalid')
                    executed = actor
                    execution_cause = 'virgin'
                    kill(actor, execution=True)
                    finish_event(event_index, offset)
                    continue
            elif 'spyRegistersTownsfolk' in event:
                return dict(status='invalid')
            for voter in event['votes']:
                if not state['alive'][voter - 1]:
                    if voter in state['spentDeadVotes']:
                        return dict(status='invalid')
                    state['spentDeadVotes'].append(voter)
            counted = len(event['votes'])
            alive_at_vote = sum(state['alive'])
            tallies.append(dict(eventIndex=event_index, nominee=target, votes=counted,
                                aliveAtVote=alive_at_vote, threshold=(alive_at_vote + 1) // 2))
            # Decide the pending execution at this vote, retaining the highest
            # count even when an earlier ballot failed. Later deaths never
            # promote a ballot that failed its own population threshold.
            if counted > highest_votes:
                highest_votes = counted
                pending_execution = target if 2 * counted >= alive_at_vote else None
            elif counted == highest_votes:
                pending_execution = None
        else:
            return dict(status='invalid')
        finish_event(event_index, offset)
    if not state.get('winner') and executed is None and pending_execution is not None:
        executed = pending_execution
        execution_cause = 'vote'
        if state['alive'][executed - 1]:
            # Saint is an execution effect, never a Slayer effect.
            kill(executed, execution=True)
    if not state.get('winner') and executed is None and sum(state['alive']) == 3:
        mayor = role_seat(state, 'Mayor')
        if mayor and healthy(mayor):
            state['winner'] = 'good'
    if set(choices) != used_choices:
        return dict(status='invalid')
    expected = dict(state=state, deaths=deaths, executedSeat=executed, executionDeathSeat=execution_death,
                    executionCause=execution_cause, endedAfterEventIndex=ended_index,
                    eventSteps=event_steps, nominationTallies=tallies, poisonAtDusk=None)
    if changes:
        expected['roleChanges'] = changes
    return dict(status='ok', expected=expected)


def fixtures():
    cases = []

    def add(mode, name, request, verdict):
        cases.append(dict(mode=mode, id=name, request=request, **verdict))

    # 11 players: 7 Townsfolk, 1 Outsider, 2 Minions, 1 Demon.
    info = ['Washerwoman', 'Librarian', 'Investigator', 'Chef', 'Empath',
            'Fortune Teller', 'Undertaker', 'Recluse', 'Spy', 'Poisoner', 'Imp']

    def info_case(name, roles, report, poison=None, tokens=None):
        request = dict(playerCount=len(roles), facts=[dict(seat=s, role=r) for s, r in enumerate(roles, 1)],
                       query=dict(seat=len(roles), role='Imp'), reports=[report], timeoutMs=10000)
        if poison is not None:
            request['nightOnePoisoner'] = dict(seat=roles.index('Poisoner') + 1, target=poison)
        if tokens:
            request['tokenFacts'] = [dict(seat=s, shownRole=r) for s, r in tokens.items()]
        verdict = report_possibilities(roles, report, poison)
        add('first_night', name, request, dict(classification='necessary' if verdict else 'inconsistent'))

    active = dict(acceptedMessage=True, abilityActive=True)
    for poison in (None, 8, 9, 4, 10):
        for count in range(5):
            info_case(f'chef-edges-poison-{poison}-count-{count}', info,
                      dict(kind='chef', speaker=4, count=count, **active), poison)
        for count in range(3):
            neighbor_roles = list(info)
            neighbor_roles[3], neighbor_roles[7] = neighbor_roles[7], neighbor_roles[3]
            neighbor_roles[5], neighbor_roles[8] = neighbor_roles[8], neighbor_roles[5]
            info_case(f'empath-two-special-neighbors-poison-{poison}-count-{count}', neighbor_roles,
                      dict(kind='empath', speaker=5, count=count, **active), poison)
    for ability, speaker, seen in (('Washerwoman', 1, 'Mayor'), ('Librarian', 2, 'Saint'),
                                   ('Investigator', 3, 'Baron')):
        special = 8 if ability == 'Investigator' else 9
        for poison in (None, special, speaker, 10):
            for targets in ([special, 11], [7, 11]):
                info_case(f'pair-{ability}-poison-{poison}-targets-{targets}', info,
                          dict(kind='pair_role', ability=ability, speaker=speaker, targets=targets,
                               seenRole=seen, **active), poison)
    for outsider in ('Recluse', 'Drunk', 'Saint', 'Butler'):
        bag = list(info)
        bag[7] = outsider
        for poison in (None, 8, 10):
            info_case(f'librarian-zero-{outsider}-poison-{poison}', bag,
                      dict(kind='librarian_zero', speaker=2, **active), poison,
                      {8: 'Mayor'} if outsider == 'Drunk' else None)
    for poison in (None, 8, 6, 10):
        for targets in ([8, 9], [10, 11], [7, 9]):
            for yes in (False, True):
                info_case(f'fortune-teller-poison-{poison}-targets-{targets}-yes-{yes}', info,
                          dict(kind='fortune_teller', speaker=6, targets=targets, yes=yes, **active), poison)
    for ability, kind, extra in (('Chef', 'chef', {'count': 4}), ('Empath', 'empath', {'count': 2}),
                                  ('Fortune Teller', 'fortune_teller', {'targets': [10, 11], 'yes': False})):
        bag = list(info)
        bag[bag.index(ability)], bag[7] = 'Drunk', ability
        drunk = bag.index('Drunk') + 1
        for active_ability, accepted in product((False, True), repeat=2):
            info_case(f'drunk-{ability}-active-{active_ability}-accepted-{accepted}', bag,
                      dict(kind=kind, speaker=drunk, abilityActive=active_ability, acceptedMessage=accepted, **extra),
                      8, {drunk: 'Mayor'})

    # Exhaust all legal completions of three genuinely unknown seats. The fixed
    # seven Townsfolk rule out Baron (+2 Outsiders); only two other Minions fit.
    # This tests necessary/impossible conclusions against counterexamples, not
    # just replay of one fully pinned assignment.
    partial_reports = [dict(kind='librarian_zero', speaker=2, **active),
        *[dict(kind='chef', speaker=4, count=c, **active) for c in range(4)],
        dict(kind='pair_role', ability='Washerwoman', speaker=1, targets=[8, 9], seenRole='Mayor', **active),
        dict(kind='pair_role', ability='Investigator', speaker=3, targets=[8, 9], seenRole='Baron', **active),
        *[dict(kind='fortune_teller', speaker=6, targets=[8, 9], yes=y, **active) for y in (False, True)]]
    completions = []
    for outsider, minion in product(OUTSIDERS, ('Spy', 'Scarlet Woman')):
        for arrangement in permutations((outsider, minion, 'Imp')):
            candidate = list(info)
            for seat, role in zip((8, 9, 11), arrangement):
                candidate[seat - 1] = role
            completions.append(candidate)
    for i, report in enumerate(partial_reports):
        compatible = [r for r in completions if report_possibilities(r, report)]
        for seat in (8, 9, 11):
            has_yes = any(r[seat - 1] == 'Imp' for r in compatible)
            has_no = any(r[seat - 1] != 'Imp' for r in compatible)
            classification = ('inconsistent' if not compatible else 'contingent' if has_yes and has_no
                              else 'necessary' if has_yes else 'impossible')
            request = dict(playerCount=11, facts=[dict(seat=s, role=r) for s, r in enumerate(info, 1) if s not in (8, 9, 11)],
                           query=dict(seat=seat, role='Imp'), reports=[report], timeoutMs=10000)
            add('first_night', f'finite-48-completions-report-{i}-query-{seat}', request,
                dict(classification=classification, independentWorlds=len(compatible)))

    # 12-player standard bag, valid even before deaths/changes.
    dynamic = ['Monk', 'Soldier', 'Mayor', 'Ravenkeeper', 'Undertaker', 'Virgin',
               'Slayer', 'Recluse', 'Butler', 'Poisoner', 'Scarlet Woman', 'Imp']
    for label, dead, poison in (('healthy', (11,), 1), ('poisoned', (11,), 8),
                                ('dead', (8, 11), 1), ('scarlet-priority', (), 1)):
        state = fresh(dynamic, dead=dead)
        actions = dict(cycle=2, poisonerTarget=poison, monkTarget=2, impTarget=12,
                       impSuccessorSeat=8, previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        add('night', f'recluse-starpass-{label}', dict(before=state, actions=actions), night(state, actions))
    for poison, guard, target in product((1, 2, 3, 4, 5, 8, 10, 11, 12), (2, 3, 4, 12), (2, 3, 4, 8, 10, 12)):
        state = fresh(dynamic, dead=(8,))
        actions = dict(cycle=2, poisonerTarget=poison, monkTarget=guard, impTarget=target,
                       previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        if target == 4 and poison != 4:
            actions['ravenkeeperTarget'] = 8
        if target == 12:
            actions['impSuccessorSeat'] = 10 if poison == 11 else 11
        add('night', f'night-poison-{poison}-guard-{guard}-attack-{target}',
            dict(before=state, actions=actions), night(state, actions))
    for poison, guard, redirect in product((2, 3, 8, 11, 12), (2, 3), (2, 4, 8, 10, 12)):
        state = fresh(dynamic, dead=(8,))
        actions = dict(cycle=2, poisonerTarget=poison, monkTarget=guard, impTarget=3,
                       mayorRedirectTarget=redirect, previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        if redirect == 4:
            actions['ravenkeeperTarget'] = 8
        add('night', f'mayor-poison-{poison}-guard-{guard}-redirect-{redirect}',
            dict(before=state, actions=actions), night(state, actions))
    for special, shown, poison, observer in product(('Recluse', 'Spy'), ('Imp', 'Saint', 'Chef', 'Poisoner'),
                                                   (2, 8), ('ravenkeeper', 'undertaker')):
        bag = list(dynamic)
        if special == 'Spy':
            bag[7], bag[10] = 'Spy', 'Recluse'
        state = fresh(bag, dead=(8,) if observer == 'undertaker' else ())
        actions = dict(cycle=2, poisonerTarget=poison, monkTarget=2, impTarget=4 if observer == 'ravenkeeper' else 2,
                       previousDayExecutionDeathSeat=8 if observer == 'undertaker' else None, butlerMasterSeat=1)
        if observer == 'ravenkeeper':
            actions.update(ravenkeeperTarget=8, ravenkeeperRegistrationRole=shown)
        else:
            actions.update(undertakerRegistrationRole=shown)
        add('night', f'{observer}-dead-registration-{special}-shown-{shown}-poison-{poison}',
            dict(before=state, actions=actions), night(state, actions))
    for alive_count, poison in product((3, 4, 5), (1, 11, 12)):
        dead = [s for s in range(1, 13) if s not in [10, 11, 12] + [2, 3][:alive_count - 3]]
        state = fresh(dynamic, dead=dead)
        actions = dict(cycle=2, poisonerTarget=poison, impTarget=12,
                       impSuccessorSeat=10 if poison == 11 or alive_count < 5 else 11,
                       previousDayExecutionDeathSeat=None)
        add('night', f'starpass-threshold-{alive_count}-poison-{poison}',
            dict(before=state, actions=actions), night(state, actions))

    nomination = lambda actor, target, votes: dict(kind='nomination', nominator=actor, nominee=target, votes=votes)
    for nominator_role, poison, spent in product(('Chef', 'Drunk', 'Spy', 'Recluse'), (1, 2, 6), (False, True)):
        bag = list(dynamic)
        exchange = {'Drunk': 7, 'Spy': 10, 'Recluse': 7}.get(nominator_role)
        if exchange is not None:
            bag[exchange] = 'Monk'
        bag[0] = nominator_role
        state = fresh(bag)
        if spent:
            state['spentVirginSeats'] = [6]
        event = nomination(1, 6, [])
        # Only supply a registration when this actual healthy interaction can use it.
        if nominator_role == 'Spy' and poison != 1 and poison != 6 and not spent:
            event['spyRegistersTownsfolk'] = True
        actions = dict(events=[event], poisonedSeat=poison, poisonSourceSeat=10, butlerMasterSeat=1)
        add('day', f'virgin-nominator-{nominator_role}-poison-{poison}-spent-{spent}',
            dict(before=state, actions=actions), day(state, actions))
    for actor_role, target, poison in product(('Slayer', 'Drunk', 'Spy'), (8, 12), (2, 7, 8, 11)):
        bag = list(dynamic)
        exchange = {'Drunk': 7, 'Spy': 10}.get(actor_role)
        if exchange is not None:
            bag[exchange] = 'Slayer'
        bag[6] = actor_role
        state = fresh(bag)
        event = dict(kind='slayer', actor=7, target=target)
        if actor_role == 'Slayer' and target == 8 and poison not in (7, 8):
            event['recluseRegistersDemon'] = True
        actions = dict(events=[event], poisonedSeat=poison, poisonSourceSeat=10, butlerMasterSeat=1)
        add('day', f'slayer-{actor_role}-target-{target}-poison-{poison}',
            dict(before=state, actions=actions), day(state, actions))
    for special, poison in product(('Saint', 'Imp'), (2, 8, 11)):
        bag = list(dynamic)
        target = 8 if special == 'Saint' else 12
        bag[7] = 'Saint'
        state = fresh(bag)
        actions = dict(events=[nomination(1, target, [1, 2, 3, 4, 5, 6])],
                       poisonedSeat=poison, poisonSourceSeat=10, butlerMasterSeat=1)
        add('day', f'execution-{special}-poison-{poison}', dict(before=state, actions=actions), day(state, actions))
    for poison, target in product((2, 3), (None, 8, 3, 12)):
        state = fresh(dynamic, dead=[s for s in range(1, 13) if s not in (3, 10, 12)])
        actions = dict(events=[] if target is None else [nomination(10, target, [3, 10])],
                       poisonedSeat=poison, poisonSourceSeat=10)
        add('day', f'terminal-three-poison-{poison}-execution-{target}',
            dict(before=state, actions=actions), day(state, actions))
    # Exhaust legal transfer targets with the initial bag fully pinned. The
    # information possibilities remain independent per observer/interaction.
    bag = ['Monk', 'Soldier', 'Mayor', 'Fortune Teller', 'Undertaker', 'Virgin',
           'Empath', 'Recluse', 'Butler', 'Spy', 'Scarlet Woman', 'Imp']
    vote = dict(kind='nomination', nominator=1, nominee=11, votes=[1, 2, 3, 4, 5, 6])
    n1 = night(fresh(bag), dict(cycle=1, butlerMasterSeat=1))['expected']
    d1 = day(n1['state'], dict(events=[vote], butlerMasterSeat=1))['expected']
    completions = []
    for successor in (8, 10):
        n2 = night(d1['state'], dict(cycle=2, impTarget=12, impSuccessorSeat=successor,
                   monkTarget=2, butlerMasterSeat=1, previousDayExecutionDeathSeat=11))['expected']
        d2 = day(n2['state'], dict(events=[], butlerMasterSeat=1))['expected']
        n3 = night(d2['state'], dict(cycle=3, impTarget=6, monkTarget=2,
                   butlerMasterSeat=1, previousDayExecutionDeathSeat=None))['expected']
        completions.append((n2, n3))
    for count, ft_yes, phase_fact in product((0, 1), (False, True), (False, True)):
        reports = [dict(kind='empath', cycle=3, speaker=7, count=count, **active),
                   dict(kind='fortune_teller', cycle=3, speaker=4, targets=[8, 2], yes=ft_yes, **active)]
        surviving = []
        # Exhaust all initially good red-herring seats, including the Recluse
        # who may later receive the Demon character without changing alignment.
        for n2, n3 in completions:
            if phase_fact and n2['state']['roles'][7] != 'Imp':
                continue
            for red_herring, alignment in enumerate(alignments_for(bag), 1):
                if alignment == 'good' and all(report_possibilities(n3['state']['roles'], r,
                        alive=n3['state']['alive'], red_herring=red_herring,
                        alignments=n3['state']['alignments']) for r in reports):
                    surviving.append(n3['state']['roles'][7] == 'Imp')
        classification = ('inconsistent' if not surviving else 'contingent' if len(set(surviving)) == 2
                          else 'necessary' if surviving[0] else 'impossible')
        request = dict(playerCount=12, facts=[dict(seat=s, role=r) for s, r in enumerate(bag, 1)],
            query=dict(seat=8, role='Recluse'), currentQuery=dict(seat=8, role='Imp'),
            phases=[dict(kind='night', cycle=1, deaths=[]),
                    dict(kind='day', cycle=1, events=[vote], deaths=[11], executedSeat=11),
                    dict(kind='night', cycle=2, deaths=[12]),
                    dict(kind='day', cycle=2, events=[], deaths=[], executedSeat=None),
                    dict(kind='night', cycle=3, deaths=[6])], laterReports=reports,
            phaseRoleFacts=[dict(seat=8, role='Imp', phaseIndex=2)] if phase_fact else [],
            timeoutMs=10000, maxWorlds=100, maxHistories=10000)
        add('observed', f'good-demon-empath-{count}-ft-{ft_yes}-phase-fact-{phase_fact}',
            request, dict(classification=classification))
    # Independent per-ability registrations at Recluse death. Scarlet Woman
    # sees an Imp only in her own chosen interaction, not automatically because
    # the Slayer saw one. Count living players immediately before the death.
    for alive_count, poison, guarded, registered in product((4, 5, 12), (1, 8, 10, 11), (False, True), (False, True)):
        living = set(range(1, 13)) if alive_count == 12 else {8, 10, 11, 12} | ({1} if alive_count == 5 else set())
        if guarded and 1 not in living:
            continue
        state = fresh(dynamic, dead=[s for s in range(1, 13) if s not in living])
        action = dict(cycle=2, poisonerTarget=poison, impTarget=8, previousDayExecutionDeathSeat=None)
        if 1 in living:
            action['monkTarget'] = 8 if guarded else 2
        if 9 in living:
            action['butlerMasterSeat'] = 1
        if registered:
            action['scarletRecluseRegistration'] = 8
        add('night', f'recluse-scarlet-night-{alive_count}-poison-{poison}-guard-{guarded}-register-{registered}',
            dict(before=state, actions=action), night(state, action))
    for cause, alive_count, poison, slayer_registration, scarlet_registration in product(
            ('execution', 'slayer'), (4, 5, 12), (None, 8, 10, 11), (False, True), (False, True)):
        if cause == 'execution' and slayer_registration:
            continue
        living = set(range(1, 13)) if alive_count == 12 else ({7, 8, 11, 12} if cause == 'slayer' and alive_count == 4
                   else {8, 10, 11, 12} | ({7} if alive_count == 5 else set()))
        if poison is not None and 10 not in living:
            continue
        state = fresh(dynamic, dead=[s for s in range(1, 13) if s not in living])
        events = [dict(kind='slayer', actor=7, target=8, recluseRegistersDemon=slayer_registration)] if cause == 'slayer' else [
            dict(kind='nomination', nominator=12, nominee=8, votes=sorted(living))]
        action = dict(events=events)
        if poison is not None:
            action.update(poisonedSeat=poison, poisonSourceSeat=10)
        if 9 in living:
            action['butlerMasterSeat'] = 1
        if scarlet_registration:
            action['scarletRecluseRegistrations'] = [8]
        add('day', f'recluse-scarlet-day-{cause}-{alive_count}-poison-{poison}-slayer-{slayer_registration}-scarlet-{scarlet_registration}',
            dict(before=state, actions=action), day(state, action))

    born = day(fresh(dynamic), dict(events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])],
               scarletRecluseRegistrations=[8], butlerMasterSeat=1))['expected']['state']
    for target in (11, 12):
        for kill_both in (False, True):
            action = dict(events=[dict(kind='slayer', actor=7, target=target)], butlerMasterSeat=1)
            if kill_both:
                action['events'].append(dict(kind='nomination', nominator=1, nominee=23 - target, votes=[1, 2, 3, 4, 5, 6]))
            add('day', f'multiple-demons-slayer-{target}-both-{kill_both}', dict(before=born, actions=action), day(born, action))
    add('night', 'multiple-demons-night-requires-complete-actions', dict(before=born, actions=dict(cycle=3)), night(born, dict(cycle=3)))

    # Ordered attacks on a reachable two-Imp state. Include invalid incomplete
    # self-transfers and turns retained after an actor dies; hand anchors below
    # independently pin the meaningful outcomes of the matrix.
    for order, poison, guard, targets in product(list(permutations((11, 12))),
            (2, 10, 11, 12), (2, 7), list(product((1, 2, 3, 6, 7, 10, 11, 12), repeat=2))):
        queue = [dict(actor=actor, target=target) for actor, target in zip(order, targets)]
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=guard, impActions=queue,
                      previousDayExecutionDeathSeat=8, butlerMasterSeat=1)
        name = f'multi-imp-order-{order}-poison-{poison}-guard-{guard}-targets-{targets}'
        add('night', name, dict(before=born, actions=action), night(born, action))
        if targets[0] == order[1]:
            action = deepcopy(action)
            action['impActions'][1] = dict(actor=order[1], skipReason='dead')
            add('night', name + '-dead-skip', dict(before=born, actions=action), night(born, action))

    for order, poison, redirects in product(list(permutations((11, 12))),
            (3, 10, 11, 12), list(product((6, 7, 10, 11, 12), repeat=2))):
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=2,
                      previousDayExecutionDeathSeat=8, butlerMasterSeat=1,
                      impActions=[dict(actor=actor, target=3, mayorRedirectTarget=redirect)
                                  for actor, redirect in zip(order, redirects)])
        add('night', f'multi-mayor-order-{order}-poison-{poison}-redirects-{redirects}',
            dict(before=born, actions=action), night(born, action))

    fifteen = ['Monk', 'Soldier', 'Mayor', 'Ravenkeeper', 'Undertaker', 'Virgin', 'Slayer',
               'Empath', 'Fortune Teller', 'Recluse', 'Butler', 'Poisoner', 'Spy', 'Scarlet Woman', 'Imp']
    two15 = day(fresh(fifteen), dict(events=[dict(kind='nomination', nominator=1, nominee=10,
                        votes=list(range(1, 9)))], scarletRecluseRegistrations=[10], butlerMasterSeat=1))['expected']['state']
    for order, poison, successors in product(list(permutations((14, 15))),
            (12, 13, 14, 15), list(product((None, 12, 13), repeat=2))):
        queue = [dict(actor=actor, target=actor, **({} if successor is None else dict(impSuccessorSeat=successor)))
                 for actor, successor in zip(order, successors)]
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=2, butlerMasterSeat=1,
                      previousDayExecutionDeathSeat=10, impActions=queue)
        add('night', f'multi-starpass-15-order-{order}-poison-{poison}-successors-{successors}',
            dict(before=two15, actions=action), night(two15, action))

    for poison, first_target, target, raven_target in product((4, 10, 12), (1, 10), (4, 5), (None, 11)):
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=2, previousDayExecutionDeathSeat=8,
                      butlerMasterSeat=1, impActions=[dict(actor=11, target=first_target), dict(actor=12, target=target)])
        if raven_target is not None:
            action['ravenkeeperTarget'] = raven_target
        add('night', f'multi-information-poison-{poison}-first-{first_target}-second-{target}-raven-{raven_target}',
            dict(before=born, actions=action), night(born, action))

    for count, second_turn in product((3, 4, 5), ('dead', 'game_over', 'attack', 'suicide')):
        state = deepcopy(born)
        alive = [11, 12] + list(range(1, count - 1))
        state['alive'] = [s in alive for s in range(1, 13)]
        second = dict(actor=12, skipReason=second_turn) if second_turn in ('dead', 'game_over') else dict(actor=12, target=12 if second_turn == 'suicide' else 11)
        action = dict(cycle=2, monkTarget=2, previousDayExecutionDeathSeat=None,
                      impActions=[dict(actor=11, target=1), second])
        add('night', f'multi-terminal-alive-{count}-second-{second_turn}', dict(before=state, actions=action), night(state, action))

    # At the end of D1 both native and Demon registration are complete legal
    # possibilities. A second Demon continues into a supported following night.
    # the current action model; it is never eliminated as an invalid setup.
    base = dict(playerCount=12, facts=[dict(seat=s, role=r) for s, r in enumerate(dynamic, 1)],
        query=dict(seat=11, role='Scarlet Woman'), currentQuery=dict(seat=11, role='Imp'),
        phases=[dict(kind='night', cycle=1, deaths=[]), dict(kind='day', cycle=1,
            events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])], deaths=[8], executedSeat=8)],
        timeoutMs=10000, maxWorlds=100, maxHistories=10000)
    for poison in (8, 10, 11):
        request = deepcopy(base)
        request['nightOnePoisoner'] = dict(seat=10, target=poison)
        possibilities = []
        n1 = night(fresh(dynamic), dict(cycle=1, poisonerTarget=poison, butlerMasterSeat=1))['expected']
        for choices in ([], [8]):
            candidate = day(n1['state'], dict(events=request['phases'][1]['events'], scarletRecluseRegistrations=choices,
                poisonedSeat=poison, poisonSourceSeat=10, butlerMasterSeat=1))
            if candidate['status'] == 'ok':
                possibilities.append(candidate['expected']['state']['roles'][10] == 'Imp')
        classification = 'contingent' if len(set(possibilities)) == 2 else 'necessary' if all(possibilities) else 'impossible'
        add('observed', f'recluse-scarlet-observed-poison-{poison}', request, dict(classification=classification))
    for pinned in (False, True):
        request = deepcopy(base)
        request['nightOnePoisoner'] = dict(seat=10, target=10)
        request['phases'].append(dict(kind='night', cycle=2, deaths=[]))
        if pinned:
            request['phaseRoleFacts'] = [dict(phaseIndex=1, seat=11, role='Imp')]
        add('observed', f'recluse-scarlet-supported-next-night-pinned-{pinned}', request,
            dict(classification='necessary' if pinned else 'contingent'))
    request = deepcopy(base)
    request['nightOnePoisoner'] = dict(seat=10, target=10)
    request['phases'] = [dict(kind='night', cycle=1, deaths=[]),
                        dict(kind='day', cycle=1, events=[], deaths=[], executedSeat=None),
                        dict(kind='night', cycle=2, deaths=[8]),
                        dict(kind='day', cycle=2, events=[dict(kind='slayer', actor=7, target=11),
                            dict(kind='nomination', nominator=1, nominee=12, votes=[1, 2, 3, 4, 5, 6])],
                            deaths=[11, 12], executedSeat=12, winner='good')]
    birth = night(fresh(dynamic), dict(cycle=2, poisonerTarget=10, monkTarget=2, impTarget=8,
        scarletRecluseRegistration=8, previousDayExecutionDeathSeat=None, butlerMasterSeat=1))['expected']
    ending = day(birth['state'], dict(events=request['phases'][3]['events'], poisonedSeat=10,
        poisonSourceSeat=10, butlerMasterSeat=1))['expected']
    assert ending['state']['winner'] == 'good' and ending['deaths'] == [11, 12]
    add('observed', 'recluse-scarlet-night-birth-day-double-kill-victory', request, dict(classification='necessary'))

    for label, died, winner, query_seat, classification in (
        ('double-kill', [6, 7], None, 11, 'necessary'),
        ('competing-transfers', [11, 12], None, 10, 'contingent'),
        ('both-old-imps-dead-game-continues', [11, 12], 'ongoing', 10, 'necessary'),
        ('both-old-imps-dead-good-wins', [11, 12], 'good', 10, 'impossible'),
        ('three-deaths-impossible', [6, 7, 9], None, 11, 'inconsistent'),
    ):
        request = dict(playerCount=12, facts=[dict(seat=s, role=r) for s, r in enumerate(dynamic, 1)],
            query=dict(seat=query_seat, role=dynamic[query_seat - 1]), currentQuery=dict(seat=query_seat, role='Imp'),
            nightOnePoisoner=dict(seat=10, target=10), timeoutMs=10000, maxWorlds=50, maxHistories=50000,
            phases=[dict(kind='night', cycle=1, deaths=[]), dict(kind='day', cycle=1,
                events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])],
                deaths=[8], executedSeat=8), dict(kind='night', cycle=2, deaths=died)])
        if winner is not None:
            request['phases'][-1]['winner'] = None if winner == 'ongoing' else winner
        add('observed', f'multi-observed-{label}', request, dict(classification=classification))

    request = dict(playerCount=15, facts=[dict(seat=s, role=r) for s, r in enumerate(fifteen, 1)],
        query=dict(seat=15, role='Imp'), nightOnePoisoner=dict(seat=12, target=12),
        phaseRoleFacts=[dict(phaseIndex=2, seat=s, role='Imp') for s in (12, 13)],
        timeoutMs=10000, maxWorlds=50, maxHistories=100000,
        phases=[dict(kind='night', cycle=1, deaths=[]), dict(kind='day', cycle=1,
            events=[dict(kind='nomination', nominator=1, nominee=10, votes=list(range(1, 9)))],
            deaths=[10], executedSeat=10), dict(kind='night', cycle=2, deaths=[14, 15]),
            dict(kind='day', cycle=2, events=[], deaths=[], executedSeat=None),
            dict(kind='night', cycle=3, deaths=[4, 6])], laterReports=[
                dict(kind='ravenkeeper', cycle=3, speaker=4, target=14, seenRole='Imp', acceptedMessage=True, abilityActive=True),
                dict(kind='fortune_teller', cycle=3, speaker=9, targets=[12, 13], yes=True, acceptedMessage=True, abilityActive=True),
                dict(kind='empath', cycle=3, speaker=8, count=0, acceptedMessage=True, abilityActive=True)])
    add('observed', 'multi-observed-15-two-transfers-next-night-and-information', request, dict(classification='necessary'))
    # Death-triggered information is fixed before later source loss or transfer.
    for order, mechanism, poison, target, registration in product(
            ('raven-first', 'source-first'), ('death', 'transfer'), (4, 5, 8, 10, 11, 12),
            (None, 8, 10, 11), (None, 'Imp', 'Poisoner')):
        raven_attack = dict(actor=11, target=4)
        source_attack = (dict(actor=12, target=10) if mechanism == 'death'
                         else dict(actor=12, target=12, impSuccessorSeat=10))
        queue = [raven_attack, source_attack] if order == 'raven-first' else [source_attack, raven_attack]
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=2, butlerMasterSeat=1,
                      previousDayExecutionDeathSeat=8, impActions=queue)
        if target is not None:
            action['ravenkeeperTarget'] = target
        if registration is not None:
            action['ravenkeeperRegistrationRole'] = registration
        add('night', f'raven-trigger-{order}-{mechanism}-poison-{poison}-target-{target}-registration-{registration}',
            dict(before=born, actions=action), night(born, action))

    for order, poison, successor, registration in product(
            ('raven-first', 'transfer-first'), (4, 12, 13, 14, 15), (12, 13), (None, 'Chef', 'Imp')):
        attacks = [dict(actor=14, target=4), dict(actor=15, target=15, impSuccessorSeat=successor)]
        if order == 'transfer-first':
            attacks.reverse()
        action = dict(cycle=2, poisonerTarget=poison, monkTarget=2, butlerMasterSeat=1,
                      previousDayExecutionDeathSeat=10, ravenkeeperTarget=13, impActions=attacks)
        if registration is not None:
            action['ravenkeeperRegistrationRole'] = registration
        add('night', f'raven-spy-before-change-{order}-poison-{poison}-successor-{successor}-registration-{registration}',
            dict(before=two15, actions=action), night(two15, action))

    for count, raven_target in product((3, 4, 5), (None, 10, 12)):
        alive = [4, 11, 12] + ([10] if count >= 4 else []) + ([7] if count == 5 else [])
        state = deepcopy(born)
        state['alive'] = [s in alive for s in range(1, 13)]
        attacks = [dict(actor=11, target=4),
                   dict(actor=12, skipReason='game_over') if count == 3 else dict(actor=12, target=11)]
        action = dict(cycle=2, impActions=attacks, previousDayExecutionDeathSeat=None)
        if count >= 4:
            action['poisonerTarget'] = 10
        if raven_target is not None:
            action['ravenkeeperTarget'] = raven_target
        add('night', f'raven-terminal-timing-count-{count}-target-{raven_target}', dict(before=state, actions=action), night(state, action))

    for order in ('source-first', 'source-last'):
        attacks = [dict(actor=11, target=10), dict(actor=12, target=7)]
        if order == 'source-last':
            attacks.reverse()
        action = dict(cycle=2, poisonerTarget=1, monkTarget=7, butlerMasterSeat=1,
                      previousDayExecutionDeathSeat=8, impActions=attacks)
        add('night', f'poisoned-monk-choice-wasted-{order}', dict(before=born, actions=action), night(born, action))

    for seen, classification in (('Poisoner', 'necessary'), ('Imp', 'necessary'), ('Spy', 'inconsistent')):
        request = dict(playerCount=12, facts=[dict(seat=s, role=r) for s, r in enumerate(dynamic, 1)],
            query=dict(seat=12, role='Imp'), nightOnePoisoner=dict(seat=10, target=10),
            timeoutMs=10000, maxWorlds=50, maxHistories=5000,
            phaseRoleFacts=[dict(phaseIndex=2, seat=10, role='Imp')],
            phases=[dict(kind='night', cycle=1, deaths=[]), dict(kind='day', cycle=1,
                events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])],
                deaths=[8], executedSeat=8), dict(kind='night', cycle=2, deaths=[4, 12])],
            laterReports=[dict(kind='ravenkeeper', cycle=2, speaker=4, target=10, seenRole=seen,
                               acceptedMessage=True, abilityActive=True)])
        add('observed', f'raven-current-Imp-read-{seen}', request, dict(classification=classification))

    request = dict(playerCount=15, facts=[dict(seat=s, role=r) for s, r in enumerate(fifteen, 1)],
        query=dict(seat=15, role='Imp'), nightOnePoisoner=dict(seat=12, target=12),
        timeoutMs=10000, maxWorlds=50, maxHistories=5000,
        phaseRoleFacts=[dict(phaseIndex=2, seat=13, role='Imp')],
        phases=[dict(kind='night', cycle=1, deaths=[]), dict(kind='day', cycle=1,
            events=[dict(kind='nomination', nominator=1, nominee=10, votes=list(range(1, 9)))],
            deaths=[10], executedSeat=10), dict(kind='night', cycle=2, deaths=[4, 15])],
        laterReports=[dict(kind='ravenkeeper', cycle=2, speaker=4, target=13, seenRole='Chef',
                           acceptedMessage=True, abilityActive=True)])
    add('observed', 'raven-Spy-registers-Chef-before-becoming-Imp', request, dict(classification='necessary'))

    request = dict(playerCount=12, facts=[dict(seat=s, role=r) for s, r in enumerate(dynamic, 1)],
        query=dict(seat=12, role='Imp'), nightOnePoisoner=dict(seat=10, target=10),
        timeoutMs=10000, maxWorlds=50, maxHistories=5000,
        phases=[dict(kind='night', cycle=1, deaths=[]),
            dict(kind='day', cycle=1, events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1,2,3,4,5,6])], deaths=[8], executedSeat=8),
            dict(kind='night', cycle=2, deaths=[6,7]),
            dict(kind='day', cycle=2, events=[dict(kind='nomination', nominator=2, nominee=1, votes=[2,3,4,5,10])], deaths=[1], executedSeat=1),
            dict(kind='night', cycle=3, deaths=[2,3]),
            dict(kind='day', cycle=3, events=[dict(kind='nomination', nominator=4, nominee=9, votes=[4,5,10])], deaths=[9], executedSeat=9),
            dict(kind='night', cycle=4, deaths=[5]),
            dict(kind='day', cycle=4, events=[], deaths=[], executedSeat=None),
            dict(kind='night', cycle=5, deaths=[4,11], winner='evil')],
        laterReports=[dict(kind='ravenkeeper', cycle=5, speaker=4, target=10, seenRole='Poisoner',
                           acceptedMessage=True, abilityActive=True)])
    add('observed', 'raven-five-night-information-before-later-evil-victory', request, dict(classification='necessary'))

    # Public day events are ordered. Vary population, the moment of a ballot,
    # ties, the cause of death, and an immediate ending independently.
    common_day = ['Slayer', 'Chef', 'Monk', 'Undertaker', 'Virgin', 'Recluse', 'Saint', 'Spy', 'Imp']
    for size in (9, 12, 15):
        day_bag = common_day + (['Soldier', 'Mayor', 'Poisoner'] if size >= 12 else [])
        if size == 15:
            day_bag += ['Washerwoman', 'Librarian', 'Scarlet Woman']
        populations = [count for count in (4, 5, 7, 8, 9, 12, 15) if count <= size]
        shot = dict(kind='slayer', actor=1, target=6, recluseRegistersDemon=True)
        for count in populations:
            living = {1, 2, 6, 9}
            living.update([seat for seat in range(1, size + 1) if seat not in living][:count - len(living)])
            state = fresh(day_bag, dead=[seat for seat in range(1, size + 1) if seat not in living])
            voters = sorted(living)
            half = (count + 1) // 2
            for ballot_count, shot_first in product((half - 1, half, half + 1), (False, True)):
                ballot = nomination(2, 3, voters[:ballot_count])
                actions = dict(events=[shot, ballot] if shot_first else [ballot, shot])
                add('day', f'day-vote-moment-{size}-{count}-{ballot_count}-shot-first-{shot_first}',
                    dict(before=state, actions=actions), day(state, actions))
            for second_count in (half - 2, half - 1, half):
                actions = dict(events=[nomination(2, 3, voters[:half - 1]), shot,
                                       nomination(1, 2, voters[:second_count])])
                add('day', f'day-vote-tie-{size}-{count}-{second_count}',
                    dict(before=state, actions=actions), day(state, actions))
            for shot_first in (False, True):
                ballot = nomination(2, 6, voters[:half])
                actions = dict(events=[shot, ballot] if shot_first else [ballot, shot])
                add('day', f'day-shot-and-corpse-execution-{size}-{count}-shot-first-{shot_first}',
                    dict(before=state, actions=actions), day(state, actions))
        for count, target in product((3, 4, 5, size), (6, 9)):
            living = {1, 6, 9} if target == 6 else {1, 7, 9}
            living.update([seat for seat in range(1, size + 1) if seat not in living][:count - len(living)])
            state = fresh(day_bag, dead=[seat for seat in range(1, size + 1) if seat not in living])
            events = [nomination(1, 7, sorted(living)[:(count + 1) // 2]),
                      dict(kind='slayer', actor=1, target=target)]
            if target == 6:
                events[1]['recluseRegistersDemon'] = True
            actions = dict(events=events)
            add('day', f'day-terminal-before-pending-execution-{size}-{count}-{target}',
                dict(before=state, actions=actions), day(state, actions))
        for actor, registration, spent, poison in product((2, 8), (False, True), (False, True),
                (None, 5, 8, 12) if size >= 12 else (None,)):
            if registration and (actor == 2 or spent or poison in (5, 8)):
                continue
            state = fresh(day_bag)
            if spent:
                state['spentVirginSeats'] = [5]
            event = nomination(actor, 5, [])
            if actor == 8 and not spent and poison not in (5, 8):
                event['spyRegistersTownsfolk'] = registration
            actions = dict(events=[nomination(1, 7, list(range(1, (size + 1) // 2 + 1))), event])
            if poison is not None:
                actions.update(poisonedSeat=poison, poisonSourceSeat=12)
            add('day', f'day-virgin-overrides-block-{size}-{actor}-{registration}-{spent}-{poison}',
                dict(before=state, actions=actions), day(state, actions))
        for cause in ('virgin', 'terminal', 'dead-vote', 'duplicate-nomination'):
            state = fresh(day_bag)
            if cause == 'virgin':
                events = [nomination(2, 5, []), dict(kind='slayer', actor=1, target=9)]
            elif cause == 'terminal':
                # No Scarlet Woman is alive, so this is the last Demon.
                if size == 15:
                    state['alive'][14] = False
                events = [dict(kind='slayer', actor=1, target=9), nomination(2, 3, [])]
            elif cause == 'dead-vote':
                state['alive'][5] = False
                events = [nomination(1, 3, [6]), nomination(2, 7, [6])]
            else:
                events = [nomination(1, 3, []), nomination(1, 7, [])]
            actions = dict(events=events)
            add('day', f'day-invalid-public-order-{size}-{cause}',
                dict(before=state, actions=actions), day(state, actions))

    def observed_day_case(name, events, deaths, executed, winner=None, later=None, report=None):
        phases = [dict(kind='night', cycle=1, deaths=[]),
                  dict(kind='day', cycle=1, events=events, deaths=deaths, executedSeat=executed)]
        if winner:
            phases[1]['winner'] = winner
        if later:
            phases.append(dict(kind='night', cycle=2, deaths=[]))
        request = dict(playerCount=9, facts=[dict(seat=s, role=r) for s, r in enumerate(common_day, 1)],
                       query=dict(seat=9, role='Imp'), phases=phases, timeoutMs=10000,
                       maxWorlds=20, maxHistories=2000)
        if report:
            request['laterReports'] = [report]
        add('observed', name, request, dict(classification='inconsistent' if name.endswith('-invalid') else 'necessary'))

    shot = dict(kind='slayer', actor=1, target=6)
    low_vote = nomination(2, 3, [1, 2, 3, 4])
    observed_day_case('day-failed-vote-before-shot', [low_vote, shot], [6], None)
    observed_day_case('day-retroactive-execution-invalid', [low_vote, shot], [6, 3], 3)
    observed_day_case('day-shot-before-valid-vote', [shot, low_vote], [6, 3], 3, later=True,
                      report=dict(kind='undertaker', cycle=2, speaker=4, seenRole='Monk', **active))
    corpse = [shot, nomination(2, 6, [1, 2, 3, 4])]
    observed_day_case('day-corpse-execution-no-information', corpse, [6], 6, later=True)
    observed_day_case('day-corpse-execution-report-invalid', corpse, [6], 6, later=True,
                      report=dict(kind='undertaker', cycle=2, speaker=4, seenRole='Recluse', **active))
    blocked_saint = nomination(2, 7, [1, 2, 3, 4, 5])
    terminal_events = [blocked_saint, dict(kind='slayer', actor=1, target=9)]
    observed_day_case('day-slayer-wins-before-pending-saint', terminal_events, [9], None, winner='good')
    observed_day_case('day-post-terminal-saint-execution-invalid', terminal_events, [9, 7], 7, winner='evil')
    observed_day_case('day-virgin-overrides-pending-saint', [blocked_saint, nomination(3, 5, [])], [3], 3,
                      later=True, report=dict(kind='undertaker', cycle=2, speaker=4, seenRole='Monk', **active))
    return cases


def check_witness(request, witness):
    """Check concrete solver evidence, not merely that some registration works."""
    errors = []
    roles, shown = witness['roles'], witness['shownTokens']
    n = request['playerCount']
    tier = (n - 7) // 3
    outsiders = (n - 7) % 3 + (2 if 'Baron' in roles else 0)
    if (len(roles) != n or len(set(roles)) != n or len(shown) != n
            or sum(r in OUTSIDERS for r in roles) != outsiders
            or sum(r in MINIONS for r in roles) != tier + 1
            or roles.count('Imp') != 1
            or sum(r in TOWNSFOLK for r in roles) != n - outsiders - tier - 2):
        errors.append('invalid setup')
    for s, role in enumerate(roles, 1):
        if role == 'Drunk':
            if shown[s - 1] not in TOWNSFOLK or shown[s - 1] in roles:
                errors.append('invalid Drunk token')
        elif shown[s - 1] != role:
            errors.append('wrong shown token')
    for fact in request.get('facts', []):
        if roles[fact['seat'] - 1] != fact['role']:
            errors.append('wrong role fact')
    for fact in request.get('tokenFacts', []):
        if shown[fact['seat'] - 1] != fact['shownRole']:
            errors.append('wrong token fact')
    action = request.get('nightOnePoisoner') or witness.get('nightOnePoisoner')
    poison = action['target'] if action else None
    if action and roles[action['seat'] - 1] != 'Poisoner':
        errors.append('invalid poisoning')
    registrations = witness.get('registrations', [])

    def register(s, interaction, field):
        role = roles[s - 1]
        choice = next((c for c in registrations if c['seat'] == s and c['interaction'] == interaction), {})
        value = choice.get(field, evil(role) if field == 'evil' else role)
        if s == poison and choice:
            errors.append('poisoned special registration')
        legal = registered_alignments(role, s == poison) if field == 'evil' else registered_roles(role, s == poison)
        if value not in legal:
            errors.append('illegal special registration')
        return value

    for i, report in enumerate(request.get('reports', [])):
        if not report_possibilities(roles, report, poison):
            errors.append('impossible report')
        if not (report['abilityActive'] and report['acceptedMessage']):
            continue
        kind = report['kind']
        if kind == 'librarian_zero':
            value = all(register(s, f'librarian_zero_{i}', 'role') not in OUTSIDERS for s in range(1, n + 1))
        elif kind == 'pair_role':
            value = any(register(s, f'pair_{i}', 'role') == report['seenRole'] for s in report['targets'])
        elif kind == 'chef':
            value = sum(register(s, f'chef_{i}_{s - 1}_left', 'evil') and
                        register(s % n + 1, f'chef_{i}_{s - 1}_right', 'evil') for s in range(1, n + 1)) == report['count']
        elif kind == 'empath':
            s = report['speaker']
            value = (int(register(s - 1 if s > 1 else n, f'empath_{i}_left', 'evil')) +
                     int(register(s % n + 1, f'empath_{i}_right', 'evil'))) == report['count']
        else:
            herring = witness.get('redHerringSeat')
            if not herring or evil(roles[herring - 1]):
                errors.append('invalid red herring')
            value = any(register(s, f'ft_{i}', 'role') == 'Imp' or s == herring for s in report['targets']) == report['yes']
        if not value:
            errors.append(f'unreplayable report {i}')
    if witness.get('timeline'):
        state = fresh(roles)
        last_night, last_day = None, None
        scarlet_records = []
        imp_records = []
        for i, phase in enumerate(witness['timeline']):
            if phase['kind'] == 'night':
                actions = deepcopy(phase['actions'])
                if actions['cycle'] > 1:
                    actions['previousDayExecutionDeathSeat'] = last_day['executionDeathSeat'] if last_day else None
                verdict = night(state, actions)
                last_night = verdict.get('expected')
            else:
                verdict = day(state, dict(events=phase['events'],
                    scarletRecluseRegistrations=phase.get('scarletRecluseRegistrations', []),
                    poisonedSeat=last_night['poisonedAtInformationStep'],
                    poisonSourceSeat=last_night['poisonSourceSeat'], butlerMasterSeat=last_night['butlerMasterSeat']))
                last_day = verdict.get('expected')
            if verdict['status'] != 'ok':
                errors.append(f'invalid history at phase {i}')
                break
            trace = verdict['expected']
            for change in trace.get('roleChanges', []):
                if change['from'] == 'Recluse':
                    suffix = f"_{change['sourceImpSeat']}" if len(trace.get('impSteps', [])) > 1 else ''
                    key = f"imp_successor_n{actions['cycle']}{suffix}"
                    imp_records.append(key)
                    recorded = [r for r in registrations if r['interaction'] == key]
                    if len(recorded) != 1 or recorded[0]['seat'] != change['seat'] or recorded[0].get('role') not in MINIONS:
                        errors.append('missing Minion registration for Recluse transfer')
                if 'registeredRecluseSeat' in change:
                    key = f"scarlet_woman_{'n' if phase['kind'] == 'night' else 'd'}{i // 2 + 1}_{change['seat']}"
                    scarlet_records.append(key)
                    records = [r for r in registrations if r['interaction'] == key]
                    if len(records) != 1 or records[0]['seat'] != change['registeredRecluseSeat'] or records[0].get('role') != 'Imp':
                        errors.append('missing Demon registration for Scarlet Woman')
            state = trace['state']
            for fact in request.get('phaseRoleFacts', []):
                if fact['phaseIndex'] == i and state['roles'][fact['seat'] - 1] != fact['role']:
                    errors.append('wrong phase role fact')
            if request.get('phases'):
                observed = request['phases'][i]
                if sorted(trace['deaths']) != sorted(observed['deaths']):
                    errors.append('wrong observed deaths')
                if observed['kind'] == 'day' and trace['executedSeat'] != observed['executedSeat']:
                    errors.append('wrong execution')
                if 'winner' in observed and state.get('winner') != observed['winner']:
                    errors.append('wrong winner')
            for report_index, report in enumerate(request.get('laterReports', [])):
                if phase['kind'] != 'night' or report['cycle'] != phase['actions']['cycle']:
                    continue
                if report['kind'] in ('empath', 'fortune_teller'):
                    if not report_possibilities(state['roles'], report, trace['poisonedAtInformationStep'],
                                                state['alive'], witness.get('redHerringSeat'), state['alignments']):
                        errors.append('impossible later information')
                    if report['abilityActive'] and report['acceptedMessage']:
                        cycle = report['cycle']
                        def later_register(seat, interaction, field):
                            actual = state['roles'][seat - 1]
                            records = [r for r in registrations if r['seat'] == seat and r['interaction'] == interaction]
                            if len(records) > 1:
                                errors.append('duplicate later registration')
                            record = records[0] if records else {}
                            native = state['alignments'][seat - 1] == 'evil' if field == 'evil' else actual
                            value = record.get(field, native)
                            disabled = seat == trace['poisonedAtInformationStep']
                            allowed = (registered_alignments(actual, disabled, state['alignments'][seat - 1])
                                       if field == 'evil' else registered_roles(actual, disabled))
                            if records and (actual not in ('Spy', 'Recluse') or disabled or field not in record):
                                errors.append('illegal later registration source')
                            if field == 'evil' and not isinstance(value, bool):
                                errors.append('malformed later alignment registration')
                            if value not in allowed:
                                errors.append('illegal later registration value')
                            return value
                        if report['kind'] == 'empath':
                            alive = [s for s in range(1, n + 1) if state['alive'][s - 1]]
                            if report['speaker'] not in alive:
                                errors.append('dead Empath')
                                continue
                            pos = alive.index(report['speaker'])
                            neighbors = (alive[pos - 1], alive[(pos + 1) % len(alive)])
                            seen = sum(int(later_register(s, f'empath_n{cycle}_{report_index}_{side}', 'evil'))
                                       for side, s in enumerate(neighbors))
                            if seen != report['count']:
                                errors.append('unreplayable later Empath registration')
                        else:
                            registered = [later_register(s, f'ft_n{cycle}_{report_index}', 'role') for s in report['targets']]
                            seen = any(r == 'Imp' or s == witness.get('redHerringSeat') for s, r in zip(report['targets'], registered))
                            if seen != report['yes']:
                                errors.append('unreplayable later Fortune Teller registration')
                elif report['kind'] == 'ravenkeeper' and report['abilityActive']:
                    moment = trace['ravenkeeperDeath']
                    if moment and moment['speaker'] != report['speaker']:
                        moment = None
                    role_at_report = (moment['roles'] if moment else state['roles'])[report['speaker'] - 1]
                    poison_at_report = moment['poisonedSeat'] if moment else trace['poisonedAtInformationStep']
                    if role_at_report != 'Ravenkeeper' or poison_at_report == report['speaker']:
                        errors.append('Ravenkeeper not healthy at the trigger')
                    if report['acceptedMessage']:
                        info = trace['ravenkeeperInfo']
                        if not info or any(info[field] != report[field] for field in ('speaker', 'target', 'seenRole')):
                            errors.append('wrong Ravenkeeper death-time display or target')
                elif report['abilityActive'] and report['acceptedMessage']:
                    info = trace['undertakerInfo']
                    if not info or info['speaker'] != report['speaker'] or info['seenRole'] != report['seenRole']:
                        errors.append('wrong character display')
        if sorted(r['interaction'] for r in registrations if r['interaction'].startswith('scarlet_woman_')) != sorted(scarlet_records):
            errors.append('unexpected Scarlet Woman registration')
        if sorted(r['interaction'] for r in registrations if r['interaction'].startswith('imp_successor_n')) != sorted(imp_records):
            errors.append('unexpected Recluse transfer registration')
        if witness.get('currentRoles') and state['roles'] != witness['currentRoles']:
            errors.append('wrong current roles')
        if 'currentAlignments' in witness and state['alignments'] != witness['currentAlignments']:
            errors.append('wrong current alignments')
        if 'currentAlive' in witness and state['alive'] != witness['currentAlive']:
            errors.append('wrong current alive table')
        if 'currentAlignments' not in witness and state['alignments'] != alignments_for(state['roles']):
            errors.append('missing nondefault current alignments')
    return errors


if __name__ == '__main__':
    if '--check-witnesses' in sys.argv:
        evidence = json.load(sys.stdin)
        print(json.dumps([dict(id=e['id'], errors=check_witness(e['request'], e['witness'])) for e in evidence]))
    else:
        print(json.dumps(dict(oracleVersion='tb-finite-python-v6', cases=fixtures()), ensure_ascii=False))
