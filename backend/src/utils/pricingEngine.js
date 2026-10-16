import { PricingRule, PriceAuditLog, VipMembership } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Dynamic Pricing Rule Engine — SRS section 32.3 / 35.
 * Fully admin-controlled: rules are pre-defined rows with an explicit
 * min/max boundary. There is no autonomous/black-box adjustment — the
 * engine only ever sums *already-approved* rule adjustments and clamps
 * the result inside [minBoundaryPercent, maxBoundaryPercent].
 */
export async function computeDynamicPrice(product, { userId = null, persistAudit = true } = {}) {
  const basePrice = Number(product.basePrice);

  const rules = await PricingRule.findAll({
    where: {
      active: true,
      [Op.or]: [{ productId: product.id }, { category: product.category }],
    },
  });

  let totalAdjustment = 0;
  let clampMin = -15;
  let clampMax = 15;
  const appliedRules = [];

  for (const rule of rules) {
    let applies = true;
    const condition = rule.condition || {};

    if (rule.ruleType === 'stock_scarcity' && condition.stockBelow != null) {
      applies = product.stock < condition.stockBelow;
    }
    if (rule.ruleType === 'vip_discount') {
      applies = false;
      if (userId) {
        const vip = await VipMembership.findOne({ where: { userId } });
        applies = !!vip;
      }
    }
    // 'demand' and 'seasonal' rule types are admin-toggled directly via `active`.

    if (applies) {
      totalAdjustment += Number(rule.adjustmentPercent);
      clampMin = Math.max(clampMin, Number(rule.minBoundaryPercent));
      clampMax = Math.min(clampMax, Number(rule.maxBoundaryPercent));
      appliedRules.push(rule.id);
    }
  }

  const clamped = Math.min(Math.max(totalAdjustment, clampMin), clampMax);
  const finalPrice = Math.round(basePrice * (1 + clamped / 100) * 100) / 100;

  if (clamped !== 0 && persistAudit) {
    await PriceAuditLog.create({
      productId: product.id,
      ruleId: appliedRules[0] || null,
      basePrice,
      finalPrice,
      adjustmentPercent: clamped,
    });
  }

  return { basePrice, finalPrice, adjustmentPercent: clamped, appliedRules };
}

/**
 * Attach a `.pricing` quote to every product in a list without writing to the
 * audit log (browsing/search is a quote, not a priced transaction — the log
 * only records prices actually shown at checkout/product-detail time).
 */
export async function attachPricingToList(products, { userId = null } = {}) {
  const priced = await Promise.all(
    products.map(async (p) => ({ ...p.toJSON(), pricing: await computeDynamicPrice(p, { userId, persistAudit: false }) }))
  );
  return priced;
}
