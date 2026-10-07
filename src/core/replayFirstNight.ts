import type { Role } from "./model";
import { ROLE_TEAM, validateInitialSetup } from "./setup";
import type { SetupQueryInput, SetupWitness } from "./symbolicSetup";

/** Independent, concrete check of a Z3 setup/first-night witness. */
export function replayFirstNight(
  input: SetupQueryInput,
  witness: SetupWitness,
) {
  const errors: string[] = [];
  const roles = witness.roles;
  const setup = validateInitialSetup(
    roles.map((actualRole, index) => ({
      seat: index + 1,
      actualRole,
      ...(actualRole === "Drunk"
        ? { shownToken: witness.shownTokens?.[index] }
        : {}),
    })),
  );
  if (
    witness.shownTokens?.length !== roles.length ||
    roles.some(
      (role, index) =>
        role !== "Drunk" && witness.shownTokens?.[index] !== role,
    )
  )
    errors.push("所见token与真实角色或座位数不一致。");
  for (const token of input.tokenFacts ?? [])
    if (witness.shownTokens?.[token.seat - 1] !== token.shownRole)
      errors.push(`${token.seat}号所见token与已采纳信息不符。`);
  if (roles.length !== input.playerCount || !setup.valid)
    errors.push(...setup.errors, "人数或初始角色设置不合法。");
  if (input.nightOnePoisoner) {
    if (roles[input.nightOnePoisoner.seat - 1] !== "Poisoner")
      errors.push("已采纳的首夜投毒者座位不是真实投毒者。 ");
    if (
      witness.nightOnePoisoner?.seat !== input.nightOnePoisoner.seat ||
      witness.nightOnePoisoner?.target !== input.nightOnePoisoner.target
    )
      errors.push("见证没有重放首夜投毒行动。 ");
  }
  for (const fact of input.facts)
    if (roles[fact.seat - 1] !== fact.role)
      errors.push(`${fact.seat}号不符合已采纳的真实角色假设。`);
  const isEvil = (role: Role) =>
    ROLE_TEAM[role] === "minion" || ROLE_TEAM[role] === "demon";
  const isPoisoned = (seat: number) => input.nightOnePoisoner?.target === seat;
  if (witness.registrations.some((choice) => isPoisoned(choice.seat)))
    errors.push("中毒角色不能作出特殊注册选择。");
  const registration = (interaction: string, seat: number) =>
    witness.registrations.find(
      (item) => item.interaction === interaction && item.seat === seat,
    );
  const registeredEvil = (seat: number, interaction: string) => {
    const actual = roles[seat - 1];
    if (!isPoisoned(seat) && (actual === "Spy" || actual === "Recluse")) {
      const choice = registration(interaction, seat);
      if (choice?.evil === undefined)
        errors.push(`缺少${interaction}对${seat}号的阵营注册选择。`);
      return choice?.evil ?? isEvil(actual);
    }
    return isEvil(actual);
  };
  for (const [index, report] of (input.reports ?? []).entries()) {
    const ability: Role =
      report.kind === "pair_role"
        ? report.ability
        : report.kind === "librarian_zero"
          ? "Librarian"
          : report.kind === "chef"
            ? "Chef"
            : report.kind === "empath"
              ? "Empath"
              : "Fortune Teller";
    if (
      report.abilityActive &&
      input.nightOnePoisoner?.target === report.speaker
    )
      errors.push(`${report.speaker}号首夜被投毒，能力不能有效。`);
    if (report.abilityActive && roles[report.speaker - 1] !== ability)
      errors.push(`${report.speaker}号没有被假定有效的${ability}能力。`);
    if (!report.abilityActive || !report.acceptedMessage) continue;
    if (report.kind === "librarian_zero") {
      if (
        roles.some((role, position) => {
          if (ROLE_TEAM[role] !== "outsider") return false;
          const seat = position + 1;
          const registered = registration(`librarian_zero_${index}`, seat)?.role;
          return !(
            role === "Recluse" &&
            !isPoisoned(seat) &&
            registered &&
            (ROLE_TEAM[registered] === "minion" || ROLE_TEAM[registered] === "demon")
          );
        })
      )
        errors.push(`第${index + 1}条图书管理员零外来者信息无法重放。`);
    } else if (report.kind === "pair_role") {
      if (
        !report.targets.some((seat) => {
          if (roles[seat - 1] === report.seenRole) return true;
          const special = report.ability === "Investigator" ? "Recluse" : "Spy";
          return (
            !isPoisoned(seat) &&
            roles[seat - 1] === special &&
            registration(`pair_${index}`, seat)?.role === report.seenRole
          );
        })
      )
        errors.push(`第${index + 1}条二选一角色信息无法重放。`);
    } else if (report.kind === "chef") {
      let count = 0;
      for (let position = 0; position < roles.length; position++) {
        const left = position + 1,
          right = ((position + 1) % roles.length) + 1;
        if (
          registeredEvil(left, `chef_${index}_${position}_left`) &&
          registeredEvil(right, `chef_${index}_${position}_right`)
        )
          count++;
      }
      if (count !== report.count)
        errors.push(
          `第${index + 1}条厨师信息应为${report.count}，见证重放得到${count}。`,
        );
    } else if (report.kind === "empath") {
      const left = report.speaker === 1 ? roles.length : report.speaker - 1;
      const right = report.speaker === roles.length ? 1 : report.speaker + 1;
      const count =
        Number(registeredEvil(left, `empath_${index}_left`)) +
        Number(registeredEvil(right, `empath_${index}_right`));
      if (count !== report.count)
        errors.push(`第${index + 1}条共情者信息无法重放。`);
    } else {
      if (
        !witness.redHerringSeat ||
        ![...roles].some(
          (role, i) =>
            i + 1 === witness.redHerringSeat &&
            (ROLE_TEAM[role] === "townsfolk" || ROLE_TEAM[role] === "outsider"),
        )
      ) {
        errors.push("占卜师红鲱鱼不是一个善良玩家。");
      }
      const yes = report.targets.some(
        (seat) =>
          roles[seat - 1] === "Imp" ||
          seat === witness.redHerringSeat ||
          (roles[seat - 1] === "Recluse" &&
            !isPoisoned(seat) &&
            registration(`ft_${index}`, seat)?.role === "Imp"),
      );
      if (yes !== report.yes)
        errors.push(`第${index + 1}条占卜师信息无法重放。`);
    }
  }
  return { valid: errors.length === 0, errors };
}
