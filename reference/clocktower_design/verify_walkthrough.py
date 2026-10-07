#!/usr/bin/env python3
"""Executable, restricted Trouble Brewing design fixture (Python 3.10+).

This is NOT a complete Trouble Brewing engine. All counts are exact projections
onto initial role assignments, under an EXPLICIT hypothetical fixed role bag and
four fixed actual-role assumptions. Claims alone never filter this fixture.
It checks the N1 information / poison interactions and the N2 events used in the
accompanying design. It does not implement Spy, Recluse, Drunk, Baron, role changes,
full nomination/vote rules, arbitrary scripts, or a general-purpose parser.

Run:
    python verify_walkthrough.py
    python -m unittest -v test_walkthrough.py
"""
from __future__ import annotations
from dataclasses import dataclass
from itertools import permutations
from math import comb, factorial, log2
from typing import Iterator
import json

ROLES = ('Investigator', 'Chef', 'Fortune Teller', 'Poisoner',
         'Monk', 'Undertaker', 'Imp', 'Butler')
SEATS = tuple(range(1, 9))
RoleAssignment = tuple[str, ...]

@dataclass(frozen=True)
class N1Witness:
    roles: RoleAssignment
    poison: int
    red_herring: int


def seat_of(roles: RoleAssignment, role: str) -> int:
    return roles.index(role) + 1


def evil_seats(roles: RoleAssignment) -> set[int]:
    return {seat_of(roles, 'Poisoner'), seat_of(roles, 'Imp')}


def role_assignments() -> Iterator[RoleAssignment]:
    """H0: fixed actual roles 1=Inv, 2=Chef, 3=FT, 6=UT; unknown 4,5,7,8."""
    for remainder in permutations(('Monk', 'Butler', 'Poisoner', 'Imp')):
        roles = list(ROLES)
        for seat, role in zip((4, 5, 7, 8), remainder):
            roles[seat - 1] = role
        yield tuple(roles)


def chef_number(roles: RoleAssignment) -> int:
    """No Spy/Recluse in this declared hypothetical bag; circular seats fixed."""
    evil = evil_seats(roles)
    return sum(s in evil and ((s % 8) + 1) in evil for s in SEATS)


def n1_witnesses(
    roles: RoleAssignment, *, investigator: bool = False, chef: bool = False,
    ft_report: bool = False, ft_healthy: bool = False,
) -> Iterator[N1Witness]:
    """inv/chef switches mean accepted reports AND active abilities at N1.

    FT-report switch means accurate report of a received NO for seats 7/8,
    but does NOT assert that this message described reality correctly.
    Poisoned information may be correct or incorrect.
    """
    poisoner = seat_of(roles, 'Poisoner')
    demon = seat_of(roles, 'Imp')
    for poison in SEATS:
        if investigator and (poison == 1 or poisoner not in (4, 5)):
            continue
        if chef and (poison == 2 or chef_number(roles) != 0):
            continue
        if ft_healthy and poison == 3:
            continue
        for red_herring in sorted(set(SEATS) - evil_seats(roles)):
            truthful_yes = demon in (7, 8) or red_herring in (7, 8)
            if ft_report and poison != 3 and truthful_yes:
                continue
            yield N1Witness(roles, poison, red_herring)


def projected_worlds(*, butler8: bool = False, **n1_flags: bool) -> list[RoleAssignment]:
    result: list[RoleAssignment] = []
    for roles in role_assignments():
        if butler8 and roles[7] != 'Butler':
            continue
        if next(n1_witnesses(roles, **n1_flags), None) is not None:
            result.append(roles)
    return result


def n2_witness_exists(w1: N1Witness) -> bool:
    """D1: seat 5 executed and died. N2: only seat 2 dies.

    A compatible trace attacks seat 2 directly. For these remaining assignments
    this is the only death mechanism available. UT6 accurately reports seeing
    Monk for the executed seat 5. FT3 accurately reports YES on seats 4/7.
    A dead Poisoner cannot poison on N2; a dead Monk cannot protect on N2.
    We search legal protection choices rather than assume protection absent.
    """
    roles = w1.roles
    poisoner = seat_of(roles, 'Poisoner')
    demon = seat_of(roles, 'Imp')
    monk = seat_of(roles, 'Monk')
    poisons: tuple[int | None, ...] = (None,) if poisoner == 5 else SEATS
    guards: tuple[int | None, ...] = (None,) if monk == 5 else tuple(s for s in SEATS if s != monk)
    for poison in poisons:
        # The observed N2 death requires the Demon ability to work.
        if poison == demon:
            continue
        for guard in guards:
            if guard == 2 and poison != monk:
                continue
            # UT information is unrestricted in value when poisoned, not forced false.
            if poison != 6 and roles[4] != 'Monk':
                continue
            ft_yes = demon in (4, 7) or w1.red_herring in (4, 7)
            if poison != 3 and not ft_yes:
                continue
            return True
    return False


def after_n2() -> list[RoleAssignment]:
    flags = dict(investigator=True, chef=True, ft_report=True)
    return [r for r in projected_worlds(butler8=True, **flags)
            if any(n2_witness_exists(w) for w in n1_witnesses(r, **flags))]


def initial_assignment_space(n: int, townsfolk: int, outsiders: int, minions: int) -> int:
    """True setup role assignments, including Baron/no-Baron, not shown tokens.
    Formula parameters are the stated standard setup counts; no histories counted.
    """
    no_baron = comb(13, townsfolk) * comb(4, outsiders) * comb(3, minions)
    baron = comb(13, townsfolk - 2) * comb(4, outsiders + 2) * comb(3, minions - 1)
    return factorial(n) * (no_baron + baron)


def report() -> dict:
    flags = dict(investigator=True, chef=True, ft_report=True)
    stages = {
        'H0_fixed_bag_and_four_actual_roles': list(role_assignments()),
        'accept_Inv_report_and_healthy_N1': projected_worlds(investigator=True),
        'also_accept_Chef_report_and_healthy_N1': projected_worlds(investigator=True, chef=True),
        'also_accept_FT_NO_report_not_health': projected_worlds(**flags),
        'contradictory_branch_also_FT_healthy_N1': projected_worlds(ft_healthy=True, **flags),
        'instead_assume_actual_Butler8': projected_worlds(butler8=True, **flags),
        'D1_execution_of_5_and_N2_death_of_2_only': projected_worlds(butler8=True, **flags),
        'also_accept_N2_UT_Monk_and_FT_YES_reports': after_n2(),
    }
    ws = [w for roles in projected_worlds(**flags) for w in n1_witnesses(roles, **flags)]
    return {
        'scope': 'Restricted hypothetical fixed-bag fixture; NOT full Trouble Brewing inference',
        'count_semantics': 'EXACT distinct initial role assignments, NOT full histories or probabilities',
        'stages': {name: {'count': len(worlds), 'possible_initial_Imp_seats': sorted({seat_of(r, 'Imp') for r in worlds})}
                   for name, worlds in stages.items()},
        'N1_poison_targets_in_all_remaining_witnesses': sorted({w.poison for w in ws}),
        'final_role_assignment': {str(s): r for s, r in zip(SEATS, after_n2()[0])},
        'information_value_example': {
            'two_hypotheses': ['P4_alive_after_D1', 'P5_dead_after_D1'],
            'report_Monk_compatible': ['P4_alive_after_D1'],
            'report_Poisoner_compatible': ['P4_alive_after_D1', 'P5_dead_after_D1'],
            'worst_case_elimination_fraction': 0.0,
            'realized_log2_reduction_after_Monk': log2(2) - log2(1),
            'warning': 'Not expected entropy, not posterior; reporting-accuracy assumption still required',
        },
        'unrestricted_initial_true_role_assignments_no_histories': {
            str(n): initial_assignment_space(n, t, o, m)
            for n, t, o, m in ((10, 7, 0, 2), (12, 7, 2, 2), (15, 9, 2, 3))
        },
    }

if __name__ == '__main__':
    print(json.dumps(report(), indent=2, ensure_ascii=False))
