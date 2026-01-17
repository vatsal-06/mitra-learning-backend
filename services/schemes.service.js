import { pool } from "../index.js";

/**
 * Check eligibility against DB rules
 */
export async function getEligibleSchemes({ profession, income }) {
  const { rows } = await pool.query(
    "SELECT * FROM government_schemes"
  );

  const eligibleSchemes = rows.filter((scheme) => {
    const rules = scheme.eligibility;

    // Income check
    if (rules.max_income && income > rules.max_income) {
      return false;
    }

    // Profession check
    if (
      rules.profession &&
      !rules.profession.includes(profession)
    ) {
      return false;
    }

    return true;
  });

  return eligibleSchemes.map((scheme) => ({
    scheme_id: scheme.scheme_id,
    scheme_name: scheme.scheme_name,
    description: scheme.description,
    benefits: scheme.benefits,
    how_to_apply: scheme.how_to_apply,
    application_url: scheme.application_url,
    eligible: true,
  }));
}
