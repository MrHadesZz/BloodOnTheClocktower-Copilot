"""Hand checked anchors for the finite oracle, independent of the app."""
import unittest
from v1_oracle import fresh, night, day, report_possibilities, registered_roles, check_witness


class OfficialAnchors(unittest.TestCase):
    def public_day_state(self, dead=()):
        return fresh(['Slayer', 'Chef', 'Monk', 'Undertaker', 'Virgin', 'Recluse', 'Saint', 'Spy', 'Imp'], dead=dead)

    def test_failed_vote_is_not_promoted_after_a_slayer_death(self):
        vote = dict(kind='nomination', nominator=2, nominee=3, votes=[1, 2, 3, 4])
        shot = dict(kind='slayer', actor=1, target=6, recluseRegistersDemon=True)
        before = day(self.public_day_state(), dict(events=[vote, shot]))['expected']
        self.assertIsNone(before['executedSeat'])
        self.assertEqual(before['deaths'], [6])
        self.assertEqual(before['nominationTallies'][0]['threshold'], 5)
        after = day(self.public_day_state(), dict(events=[shot, vote]))['expected']
        self.assertEqual(after['executedSeat'], 3)
        self.assertEqual(after['executionDeathSeat'], 3)
        self.assertEqual(after['nominationTallies'][0]['threshold'], 4)

    def test_terminal_shot_does_not_execute_pending_saint(self):
        events = [dict(kind='nomination', nominator=2, nominee=7, votes=[1, 2, 3, 4, 5]),
                  dict(kind='slayer', actor=1, target=9)]
        trace = day(self.public_day_state(), dict(events=events))['expected']
        self.assertEqual(trace['state']['winner'], 'good')
        self.assertEqual(trace['deaths'], [9])
        self.assertIsNone(trace['executedSeat'])
        self.assertIsNone(trace['executionDeathSeat'])
        self.assertEqual(trace['endedAfterEventIndex'], 1)

    def test_two_alive_terminal_shot_does_not_execute_pending_imp(self):
        state = self.public_day_state(dead=(2, 3, 4, 5, 7, 8))
        events = [dict(kind='nomination', nominator=1, nominee=9, votes=[1, 6]),
                  dict(kind='slayer', actor=1, target=6, recluseRegistersDemon=True)]
        trace = day(state, dict(events=events))['expected']
        self.assertEqual(trace['state']['winner'], 'evil')
        self.assertEqual(trace['deaths'], [6])
        self.assertIsNone(trace['executedSeat'])
        self.assertTrue(trace['state']['alive'][8])

    def test_slayer_death_followed_by_dead_execution_does_not_trigger_undertaker(self):
        events = [dict(kind='slayer', actor=1, target=6, recluseRegistersDemon=True),
                  dict(kind='nomination', nominator=2, nominee=6, votes=[1, 2, 3, 4])]
        trace = day(self.public_day_state(), dict(events=events))['expected']
        self.assertEqual(trace['executedSeat'], 6)
        self.assertIsNone(trace['executionDeathSeat'])
        info = night(trace['state'], dict(cycle=2, monkTarget=2, impTarget=6,
                    previousDayExecutionDeathSeat=trace['executionDeathSeat']))['expected']
        self.assertIsNone(info['undertakerInfo'])

    def test_virgin_overrides_block_and_supplies_execution_death(self):
        events = [dict(kind='nomination', nominator=2, nominee=7, votes=[1, 2, 3, 4, 5]),
                  dict(kind='nomination', nominator=3, nominee=5, votes=[])]
        trace = day(self.public_day_state(), dict(events=events))['expected']
        self.assertEqual(trace['executedSeat'], 3)
        self.assertEqual(trace['executionDeathSeat'], 3)
        self.assertEqual(trace['executionCause'], 'virgin')
        self.assertEqual(trace['deaths'], [3])

    def test_a_later_equal_ballot_still_ties_the_earlier_failed_tally(self):
        events = [dict(kind='nomination', nominator=2, nominee=3, votes=[1, 2, 3, 4]),
                  dict(kind='slayer', actor=1, target=6, recluseRegistersDemon=True),
                  dict(kind='nomination', nominator=1, nominee=2, votes=[1, 2, 3, 4])]
        trace = day(self.public_day_state(), dict(events=events))['expected']
        self.assertIsNone(trace['executedSeat'])
        self.assertEqual(trace['deaths'], [6])

    def test_invalid_public_order_is_rejected(self):
        win = dict(kind='slayer', actor=1, target=9)
        vote = dict(kind='nomination', nominator=2, nominee=3, votes=[])
        self.assertEqual(day(self.public_day_state(), dict(events=[win, vote]))['status'], 'invalid')
        first = dict(kind='nomination', nominator=1, nominee=3, votes=[6])
        second = dict(kind='nomination', nominator=2, nominee=7, votes=[6])
        self.assertEqual(day(self.public_day_state(dead=(6,)), dict(events=[first, second]))['status'], 'invalid')

    def scarlet_state(self, dead=()):
        return fresh(['Monk', 'Soldier', 'Mayor', 'Ravenkeeper', 'Undertaker', 'Virgin',
                      'Slayer', 'Recluse', 'Butler', 'Poisoner', 'Scarlet Woman', 'Imp'], dead=dead)

    def test_scarlet_and_slayer_use_independent_recluse_registrations(self):
        actions = dict(events=[dict(kind='slayer', actor=7, target=8, recluseRegistersDemon=True)], butlerMasterSeat=1)
        native = day(self.scarlet_state(), actions)['expected']
        self.assertEqual(native['deaths'], [8])
        self.assertEqual(native['state']['roles'][10], 'Scarlet Woman')
        actions['scarletRecluseRegistrations'] = [8]
        inherited = day(self.scarlet_state(), actions)['expected']
        self.assertEqual(inherited['state']['roles'][10:], ['Imp', 'Imp'])
        self.assertEqual(inherited['state']['alignments'][7], 'good')
        actions['events'][0]['recluseRegistersDemon'] = False
        self.assertEqual(day(self.scarlet_state(), actions)['status'], 'invalid')

    def test_scarlet_recluse_death_requires_five_before_death_and_healthy_participants(self):
        actions = dict(events=[dict(kind='slayer', actor=7, target=8, recluseRegistersDemon=True)], scarletRecluseRegistrations=[8])
        five = self.scarlet_state(dead=(1, 2, 3, 4, 5, 6, 9))
        result = day(five, actions)['expected']
        self.assertEqual(sum(result['state']['alive']), 4)
        self.assertEqual(result['state']['roles'][10], 'Imp')
        four = self.scarlet_state(dead=(1, 2, 3, 4, 5, 6, 9, 10))
        self.assertEqual(day(four, actions)['status'], 'invalid')
        for poisoned in (8, 11):
            execution = dict(events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])],
                             scarletRecluseRegistrations=[8], butlerMasterSeat=1, poisonedSeat=poisoned, poisonSourceSeat=10)
            self.assertEqual(day(self.scarlet_state(), execution)['status'], 'invalid')

    def test_all_living_demons_must_die_for_the_normal_good_victory(self):
        creation = dict(events=[dict(kind='nomination', nominator=1, nominee=8, votes=[1, 2, 3, 4, 5, 6])],
                        scarletRecluseRegistrations=[8], butlerMasterSeat=1)
        state = day(self.scarlet_state(), creation)['expected']['state']
        events = [dict(kind='slayer', actor=7, target=11)]
        self.assertNotIn('winner', day(state, dict(events=events, butlerMasterSeat=1))['expected']['state'])
        events.append(dict(kind='nomination', nominator=1, nominee=12, votes=[1, 2, 3, 4, 5, 6]))
        self.assertEqual(day(state, dict(events=events, butlerMasterSeat=1))['expected']['state']['winner'], 'good')
        self.assertEqual(night(state, dict(cycle=2))['status'], 'invalid')

    def two_imps(self):
        return day(self.scarlet_state(), dict(events=[dict(kind='nomination', nominator=1,
            nominee=8, votes=[1, 2, 3, 4, 5, 6])], scarletRecluseRegistrations=[8], butlerMasterSeat=1))['expected']['state']

    def ordered_night(self, queue, state=None, **overrides):
        actions = dict(cycle=2, poisonerTarget=10, monkTarget=2, butlerMasterSeat=1,
                       previousDayExecutionDeathSeat=8, impActions=queue)
        actions.update(overrides)
        return night(state if state is not None else self.two_imps(), actions)

    def test_two_imps_kill_separately_and_a_repeated_target_dies_once(self):
        queue = [dict(actor=11, target=6), dict(actor=12, target=7)]
        self.assertEqual(self.ordered_night(queue)['expected']['deaths'], [6, 7])
        queue[1]['target'] = 6
        self.assertEqual(self.ordered_night(queue)['expected']['deaths'], [6])

    def test_a_dead_queued_imp_cannot_act(self):
        queue = [dict(actor=11, target=12), dict(actor=12, skipReason='dead')]
        result = self.ordered_night(queue)['expected']
        self.assertEqual(result['deaths'], [12])
        self.assertNotIn('winner', result['state'])
        queue[1] = dict(actor=12, target=6)
        self.assertEqual(self.ordered_night(queue)['status'], 'invalid')

    def test_source_death_cures_a_later_imp_before_its_turn(self):
        queue = [dict(actor=11, target=10), dict(actor=12, target=7)]
        result = self.ordered_night(queue, poisonerTarget=12)['expected']
        self.assertEqual(result['deaths'], [10, 7])
        self.assertIsNone(result['poisonedAtInformationStep'])
        self.assertEqual(self.ordered_night(list(reversed(queue)), poisonerTarget=12)['expected']['deaths'], [10])

    def test_monk_source_death_removes_protection_for_the_later_imp(self):
        queue = [dict(actor=11, target=1), dict(actor=12, target=7)]
        result = self.ordered_night(queue, monkTarget=7)['expected']
        self.assertEqual(result['deaths'], [1, 7])
        self.assertIsNone(result['protectedSeat'])
        self.assertEqual(self.ordered_night(list(reversed(queue)), monkTarget=7)['expected']['deaths'], [1])

    def test_source_character_change_cures_the_later_imp_before_its_turn(self):
        queue = [dict(actor=11, target=11, impSuccessorSeat=10), dict(actor=12, target=7)]
        result = self.ordered_night(queue, poisonerTarget=12)['expected']
        self.assertEqual(result['deaths'], [11, 7])
        self.assertEqual(result['state']['roles'][9], 'Imp')
        self.assertIsNone(result['poisonSourceSeat'])

    def test_poisoned_soldier_recovers_before_the_later_attack(self):
        queue = [dict(actor=11, target=10), dict(actor=12, target=2)]
        self.assertEqual(self.ordered_night(queue, poisonerTarget=2, monkTarget=3)['expected']['deaths'], [10])
        self.assertEqual(self.ordered_night(list(reversed(queue)), poisonerTarget=2, monkTarget=3)['expected']['deaths'], [2, 10])

    def test_successor_is_consumed_once_and_does_not_act_tonight(self):
        queue = [dict(actor=11, target=11, impSuccessorSeat=10), dict(actor=12, target=12)]
        result = self.ordered_night(queue)['expected']
        self.assertEqual(result['deaths'], [11, 12])
        self.assertEqual(result['state']['roles'][9], 'Imp')
        self.assertEqual(len(result['impSteps']), 2)
        self.assertNotIn('winner', result['state'])
        queue[1]['impSuccessorSeat'] = 10
        self.assertEqual(self.ordered_night(queue)['status'], 'invalid')

    def test_mayor_redirect_is_not_a_self_chosen_imp_suicide(self):
        queue = [dict(actor=11, target=3, mayorRedirectTarget=11), dict(actor=12, target=6)]
        result = self.ordered_night(queue)['expected']
        self.assertEqual(result['deaths'], [11, 6])
        self.assertEqual(result['state']['roles'][9], 'Poisoner')
        queue[0]['impSuccessorSeat'] = 10
        self.assertEqual(self.ordered_night(queue)['status'], 'invalid')

    def test_game_ends_before_the_next_queued_attack(self):
        state = self.two_imps()
        state['alive'] = [s in (1, 11, 12) for s in range(1, 13)]
        action = dict(cycle=2, monkTarget=2, previousDayExecutionDeathSeat=None,
                      impActions=[dict(actor=11, target=1), dict(actor=12, skipReason='game_over')])
        result = night(state, action)['expected']
        self.assertEqual(result['state']['winner'], 'evil')
        self.assertEqual(result['deaths'], [1])
        action['impActions'][1] = dict(actor=12, target=11)
        self.assertEqual(night(state, action)['status'], 'invalid')

    def test_single_demon_night_can_create_a_second_demon_on_recluse_death(self):
        actions = dict(cycle=2, poisonerTarget=10, monkTarget=2, impTarget=8,
                       scarletRecluseRegistration=8, previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        result = night(self.scarlet_state(), actions)['expected']
        self.assertEqual(result['deaths'], [8])
        self.assertEqual(result['state']['alive'][10:], [True, True])
        self.assertEqual(result['state']['roles'][10:], ['Imp', 'Imp'])
        actions['monkTarget'] = 8
        self.assertEqual(night(self.scarlet_state(), actions)['status'], 'invalid')

    def test_ravenkeeper_sees_a_character_before_a_later_transfer(self):
        queue = [dict(actor=11, target=4), dict(actor=12, target=12, impSuccessorSeat=10)]
        result = self.ordered_night(queue, ravenkeeperTarget=10)['expected']
        self.assertEqual(result['ravenkeeperInfo'], dict(speaker=4, target=10, seenRole='Poisoner'))
        self.assertEqual(result['state']['roles'][9], 'Imp')
        self.assertEqual(result['ravenkeeperDeath']['roles'][9], 'Poisoner')
        self.assertEqual(self.ordered_night(list(reversed(queue)), ravenkeeperTarget=10)['expected']['ravenkeeperInfo']['seenRole'], 'Imp')

    def test_ravenkeeper_trigger_lost_to_poison_does_not_reappear_on_recovery(self):
        queue = [dict(actor=11, target=4), dict(actor=12, target=10)]
        result = self.ordered_night(queue, poisonerTarget=4)['expected']
        self.assertIsNone(result['ravenkeeperInfo'])
        self.assertEqual(result['ravenkeeperDeath']['poisonedSeat'], 4)
        self.assertIsNone(result['poisonedAtInformationStep'])
        self.assertEqual(self.ordered_night(queue, poisonerTarget=4, ravenkeeperTarget=11)['status'], 'invalid')
        recovered_first = self.ordered_night(list(reversed(queue)), poisonerTarget=4, ravenkeeperTarget=11)['expected']
        self.assertEqual(recovered_first['ravenkeeperInfo']['seenRole'], 'Imp')

    def test_ravenkeeper_registration_uses_the_targets_health_when_the_info_is_given(self):
        queue = [dict(actor=11, target=4), dict(actor=12, target=10)]
        self.assertEqual(self.ordered_night(queue, poisonerTarget=8, ravenkeeperTarget=8, ravenkeeperRegistrationRole='Imp')['status'], 'invalid')
        result = self.ordered_night(list(reversed(queue)), poisonerTarget=8, ravenkeeperTarget=8, ravenkeeperRegistrationRole='Imp')['expected']
        self.assertEqual(result['ravenkeeperInfo']['seenRole'], 'Imp')

    def test_earlier_ravenkeeper_information_remains_after_a_later_terminal_attack(self):
        state = self.two_imps()
        state['alive'] = [s in (4, 10, 11, 12) for s in range(1, 13)]
        action = dict(cycle=2, poisonerTarget=10, ravenkeeperTarget=10,
                      impActions=[dict(actor=11, target=4), dict(actor=12, target=11)])
        result = night(state, action)['expected']
        self.assertEqual(result['state']['winner'], 'evil')
        self.assertEqual(result['ravenkeeperInfo']['seenRole'], 'Poisoner')
        self.assertFalse(result['ravenkeeperDeath']['gameOver'])

    def test_recovered_undertaker_works_at_its_later_information_step(self):
        queue = [dict(actor=11, target=4), dict(actor=12, target=10)]
        result = self.ordered_night(queue, poisonerTarget=5, ravenkeeperTarget=10)['expected']
        self.assertEqual(result['undertakerInfo'], dict(speaker=5, executedSeat=8, seenRole='Recluse'))

    def test_a_poisoned_monk_choice_is_not_repeated_when_health_returns(self):
        queue = [dict(actor=11, target=10), dict(actor=12, target=7)]
        result = self.ordered_night(queue, poisonerTarget=1, monkTarget=7)['expected']
        self.assertEqual(result['deaths'], [10, 7])
        self.assertIsNone(result['protectedSeat'])

    def test_registration_has_no_other_role_ability(self):
        self.assertIn('Saint', registered_roles('Spy'))
        self.assertNotIn('Imp', registered_roles('Spy'))
        self.assertIn('Imp', registered_roles('Recluse'))
        self.assertEqual(registered_roles('Recluse', True), {'Recluse'})

    def test_chef_split_edges(self):
        roles = ['Chef', 'Imp', 'Recluse', 'Poisoner', 'Monk', 'Empath', 'Saint']
        report = dict(kind='chef', speaker=1, count=1, abilityActive=True, acceptedMessage=True)
        self.assertTrue(report_possibilities(roles, report))
        self.assertFalse(report_possibilities(roles, report, poison=3))

    def test_zero_depends_on_outsider_registration(self):
        roles = ['Librarian', 'Chef', 'Monk', 'Empath', 'Slayer', 'Recluse', 'Spy', 'Imp']
        report = dict(kind='librarian_zero', speaker=1, abilityActive=True, acceptedMessage=True)
        self.assertTrue(report_possibilities(roles, report))
        self.assertFalse(report_possibilities(roles, report, poison=6))
        roles[5] = 'Saint'
        self.assertFalse(report_possibilities(roles, report))

    def test_drunk_information_can_be_correct_or_incorrect(self):
        roles = ['Drunk', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Saint', 'Butler']
        report = dict(kind='empath', speaker=1, count=2, abilityActive=False, acceptedMessage=True)
        self.assertTrue(report_possibilities(roles, report, poison=1))
        report['abilityActive'] = True
        self.assertFalse(report_possibilities(roles, report))

    def test_soldier_and_demon_poison(self):
        state = fresh(['Soldier', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Empath', 'Slayer'])
        action = dict(cycle=2, impTarget=1, poisonerTarget=2, monkTarget=2)
        self.assertEqual(night(state, action)['expected']['deaths'], [])
        action['poisonerTarget'] = 1
        self.assertEqual(night(state, action)['expected']['deaths'], [1])
        action['poisonerTarget'] = 4
        self.assertEqual(night(state, action)['expected']['deaths'], [])

    def test_poison_ends_on_starpass(self):
        state = fresh(['Empath', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'])
        trace = night(state, dict(cycle=2, poisonerTarget=1, monkTarget=2, impTarget=4, impSuccessorSeat=3))['expected']
        self.assertEqual(trace['state']['roles'][2], 'Imp')
        self.assertIsNone(trace['poisonedAtInformationStep'])

    def test_self_poison_lasts_to_dusk(self):
        state = fresh(['Empath', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'])
        trace = night(state, dict(cycle=2, poisonerTarget=3, monkTarget=2, impTarget=1))['expected']
        self.assertEqual(trace['poisonedAtInformationStep'], 3)
        dusk = day(trace['state'], dict(events=[], poisonedSeat=3, poisonSourceSeat=3))['expected']
        self.assertIsNone(dusk['poisonAtDusk'])

    def test_recluse_starpass_preserves_actual_alignment(self):
        state = fresh(['Monk', 'Soldier', 'Mayor', 'Ravenkeeper', 'Undertaker', 'Virgin',
                       'Slayer', 'Recluse', 'Butler', 'Poisoner', 'Scarlet Woman', 'Imp'], dead=(11,))
        action = dict(cycle=2, poisonerTarget=1, monkTarget=2, impTarget=12,
                      impSuccessorSeat=8, previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        trace = night(state, action)['expected']
        self.assertEqual(trace['state']['roles'][7], 'Imp')
        self.assertEqual(trace['state']['alignments'][7], 'good')
        action['poisonerTarget'] = 8
        self.assertEqual(night(state, action)['status'], 'invalid')
        action['poisonerTarget'] = 1
        state['alive'][10] = True
        self.assertEqual(night(state, action)['status'], 'invalid')

    def test_good_imp_information_uses_alignment_and_character_separately(self):
        state = fresh(['Monk', 'Soldier', 'Mayor', 'Fortune Teller', 'Undertaker', 'Virgin',
                       'Empath', 'Recluse', 'Butler', 'Poisoner', 'Scarlet Woman', 'Imp'], dead=(11,))
        action = dict(cycle=2, poisonerTarget=10, monkTarget=2, impTarget=12,
                      impSuccessorSeat=8, previousDayExecutionDeathSeat=None, butlerMasterSeat=1)
        result = night(state, action)['expected']['state']
        accepted = dict(abilityActive=True, acceptedMessage=True)
        self.assertTrue(report_possibilities(result['roles'], dict(kind='empath', speaker=7, count=0, **accepted),
                                            alive=result['alive'], alignments=result['alignments']))
        self.assertFalse(report_possibilities(result['roles'], dict(kind='empath', speaker=7, count=1, **accepted),
                                             alive=result['alive'], alignments=result['alignments']))
        self.assertTrue(report_possibilities(result['roles'], dict(kind='fortune_teller', speaker=4, targets=[8, 2], yes=True, **accepted),
                                            alive=result['alive'], red_herring=1, alignments=result['alignments']))

    def test_self_poison_does_not_block_receiving_a_new_character(self):
        state = fresh(['Empath', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'])
        result = night(state, dict(cycle=2, poisonerTarget=3, monkTarget=2, impTarget=4, impSuccessorSeat=3))['expected']
        self.assertEqual(result['state']['roles'][2], 'Imp')
        self.assertEqual(result['state']['alignments'][2], 'evil')
        self.assertIsNone(result['poisonedAtInformationStep'])

    def test_a_good_imp_still_counts_for_demon_victory_conditions(self):
        roles = ['Empath', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier']
        state = fresh(roles, dead=(2, 5, 6, 7))
        state['alignments'][3] = 'good'
        result = day(state, dict(events=[dict(kind='nomination', nominator=1, nominee=4, votes=[1, 3])]))['expected']
        self.assertEqual(result['state']['winner'], 'good')
        result = night(state, dict(cycle=2, poisonerTarget=3, impTarget=1))['expected']
        self.assertEqual(result['state']['winner'], 'evil')

    def test_poisoned_slayer_spends_once(self):
        state = fresh(['Slayer', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Empath', 'Soldier'])
        trace = day(state, dict(events=[dict(kind='slayer', actor=1, target=4)], poisonedSeat=1, poisonSourceSeat=3))['expected']
        self.assertEqual(trace['deaths'], [])
        self.assertEqual(trace['state']['spentSlayerSeats'], [1])

    def test_healthy_and_poisoned_saint(self):
        state = fresh(['Saint', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'])
        actions = dict(events=[dict(kind='nomination', nominator=2, nominee=1, votes=[2, 3, 4, 5])])
        self.assertEqual(day(state, actions)['expected']['state']['winner'], 'evil')
        actions.update(poisonedSeat=1, poisonSourceSeat=3)
        self.assertNotIn('winner', day(state, actions)['expected']['state'])

    def test_impaired_virgin_stays_spent(self):
        state = fresh(['Virgin', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'])
        actions = dict(events=[dict(kind='nomination', nominator=2, nominee=1, votes=[])], poisonedSeat=1, poisonSourceSeat=3)
        trace = day(state, actions)['expected']
        self.assertEqual(trace['state']['spentVirginSeats'], [1])
        self.assertEqual(trace['deaths'], [])
        actions.pop('poisonedSeat')
        actions.pop('poisonSourceSeat')
        self.assertEqual(day(trace['state'], actions)['expected']['deaths'], [])

    def test_dead_execution_blocks_mayor_win(self):
        state = fresh(['Mayor', 'Chef', 'Poisoner', 'Imp', 'Monk', 'Slayer', 'Soldier'], dead=(2, 5, 6, 7))
        self.assertEqual(day(state, dict(events=[]))['expected']['state']['winner'], 'good')
        actions = dict(events=[dict(kind='nomination', nominator=3, nominee=2, votes=[1, 3])])
        trace = day(state, actions)['expected']
        self.assertEqual(trace['deaths'], [])
        self.assertNotIn('winner', trace['state'])

    def test_witness_checker_rejects_missing_zero_registration(self):
        roles = ['Librarian', 'Chef', 'Monk', 'Empath', 'Slayer', 'Recluse', 'Spy', 'Imp']
        request = dict(playerCount=8, reports=[dict(kind='librarian_zero', speaker=1, abilityActive=True, acceptedMessage=True)])
        witness = dict(roles=roles, shownTokens=roles, registrations=[dict(interaction='librarian_zero_0', seat=6, role='Imp')])
        self.assertEqual(check_witness(request, witness), [])
        witness['registrations'] = []
        self.assertIn('unreplayable report 0', check_witness(request, witness))


if __name__ == '__main__':
    unittest.main()
