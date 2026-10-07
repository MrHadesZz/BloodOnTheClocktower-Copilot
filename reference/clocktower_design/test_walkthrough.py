import unittest
from verify_walkthrough import (
    ROLES, role_assignments, projected_worlds, n1_witnesses, after_n2,
    evil_seats, chef_number, seat_of, initial_assignment_space,
)

class WalkthroughTests(unittest.TestCase):
    def test_fixed_bag_has_24_unique_role_assignments(self):
        worlds = list(role_assignments())
        self.assertEqual(len(worlds), 24)
        self.assertEqual(len(set(worlds)), 24)
        for r in worlds:
            self.assertEqual(set(r), set(ROLES))

    def test_recording_claims_does_not_assume_them(self):
        self.assertEqual(len(projected_worlds()), 24)

    def test_investigator_gate(self):
        worlds = projected_worlds(investigator=True)
        self.assertEqual(len(worlds), 12)
        self.assertTrue(all(seat_of(r, 'Poisoner') in (4,5) for r in worlds))

    def test_chef_gate(self):
        worlds = projected_worlds(investigator=True, chef=True)
        self.assertEqual(len(worlds), 8)
        self.assertEqual({seat_of(r, 'Imp') for r in worlds}, {7,8})

    def test_chef_circular_wraparound(self):
        r = list(ROLES)
        r[3], r[7] = r[7], r[3]  # Poisoner to seat 8
        r[6], r[0] = r[0], r[6]  # Imp to seat 1
        self.assertEqual(evil_seats(tuple(r)), {8,1})
        self.assertEqual(chef_number(tuple(r)), 1)

    def test_FT_report_does_not_mean_FT_correct(self):
        self.assertEqual(len(projected_worlds(investigator=True, chef=True, ft_report=True)), 8)

    def test_poison_3_is_necessary(self):
        flags = dict(investigator=True, chef=True, ft_report=True)
        targets = {w.poison for r in projected_worlds(**flags) for w in n1_witnesses(r, **flags)}
        self.assertEqual(targets, {3})

    def test_healthy_FT_branch_is_unsatisfiable(self):
        self.assertEqual(projected_worlds(investigator=True, chef=True, ft_report=True, ft_healthy=True), [])

    def test_Butler8_leaves_two_role_assignments(self):
        worlds = projected_worlds(investigator=True, chef=True, ft_report=True, butler8=True)
        self.assertEqual(len(worlds), 2)
        self.assertEqual({seat_of(r, 'Imp') for r in worlds}, {7})

    def test_dead_poisoner_cannot_explain_N2_UT(self):
        worlds = after_n2()
        self.assertEqual(len(worlds), 1)
        self.assertEqual(worlds[0], ROLES)

    def test_actual_trace_is_retained(self):
        witnesses = list(n1_witnesses(ROLES, investigator=True, chef=True, ft_report=True))
        self.assertTrue(any(w.poison == 3 and w.red_herring == 1 for w in witnesses))

    def test_projection_hides_nuisance_multiplicity(self):
        flags = dict(investigator=True, chef=True, ft_report=True)
        worlds = projected_worlds(**flags)
        witnesses = [w for r in worlds for w in n1_witnesses(r, **flags)]
        self.assertGreater(len(witnesses), len(worlds))
        self.assertEqual(len({w.roles for w in witnesses}), 8)

    def test_initial_search_space(self):
        self.assertEqual(initial_assignment_space(10,7,0,2), 102745843200)
        self.assertEqual(initial_assignment_space(12,7,2,2), 16644826598400)
        self.assertEqual(initial_assignment_space(15,9,2,3), 12341830685184000)

if __name__ == '__main__':
    unittest.main()
