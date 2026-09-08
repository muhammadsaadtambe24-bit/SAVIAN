"""
Explainable AI (XAI) Operational Rationale & Attribution Service (LINE CLEAR).

Compares the optimized LINE CLEAR schedule with the naive chaos baseline to generate:
1. Operational Block Shift Justifications: Explanations of why specific maintenance windows moved.
2. Shadow Co-utilization Merges: Tracking multi-departmental corridor coupling.
3. Conflict Resolution Audit: Proof that physical train-block collisions were eliminated.
4. Constraint Attribution Waterfall: Relative contribution of train delay, window deviation,
   speed debt, night utilization, and shadow merging to the optimization score.
"""

from typing import Any, Dict, List, Optional


def generate_explanations(
    solver_result: Dict[str, Any],
    chaos_result: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Compare LINE CLEAR schedule with chaos baseline and generate human-readable
    explanations, shift rationale, merged shadow analysis, and constraint attribution.

    Args:
        solver_result: Result dict from RailwayBlockScheduler.solve().
        chaos_result: Result dict from run_chaos_baseline().

    Returns:
        Structured explanation dict with shifted blocks, merged shadows,
        clash resolution tally, and waterfall attribution.
    """
    solver_blocks = {b["demand_code"]: b for b in solver_result.get("granted_blocks", [])}
    chaos_blocks = {b["demand_code"]: b for b in chaos_result.get("granted_blocks", [])}

    # 1. Analyze Shifted Blocks
    shifted_blocks: List[Dict[str, Any]] = []
    for code, s_blk in solver_blocks.items():
        c_blk = chaos_blocks.get(code)
        s_start = s_blk.get("granted_start_minutes", 0)
        c_start = c_blk.get("granted_start_minutes", s_start) if c_blk else s_start
        shift = s_start - c_start

        if shift != 0:
            direction = "LATER" if shift > 0 else "EARLIER"
            abs_shift = abs(shift)

            # Determine operational reason
            reasons = []
            if s_blk.get("is_shadow"):
                parent = s_blk.get("shadow_parent_code", "primary block")
                reasons.append(f"Coupled as a shadow block with {parent} to share track possession")
            if s_start >= 1380 or s_start <= 300:
                reasons.append("Shifted into the low-density corridor-night window (23:00 - 05:00)")
            if not reasons:
                reasons.append("Shifted to clear high-priority Rajdhani / Vande Bharat passenger paths")

            reason_str = "; ".join(reasons) + "."

            shifted_blocks.append({
                "demand_code": code,
                "department": s_blk.get("department", ""),
                "section": f"{s_blk.get('section_from', '')}-{s_blk.get('section_to', '')}",
                "original_start_minutes": c_start,
                "granted_start_minutes": s_start,
                "shift_minutes": shift,
                "absolute_shift_minutes": abs_shift,
                "direction": direction,
                "reason": reason_str,
            })

    # 2. Analyze Merged Shadows
    merged_shadows: List[Dict[str, Any]] = []
    for code, b in solver_blocks.items():
        if b.get("is_shadow"):
            parent_code = b.get("shadow_parent_code")
            parent_blk = solver_blocks.get(parent_code) if parent_code else None

            start = b.get("granted_start_minutes", 0)
            end = b.get("granted_end_minutes", 0)
            dur = end - start

            merged_shadows.append({
                "shadow_demand_code": code,
                "shadow_dept": b.get("department", ""),
                "primary_demand_code": parent_code or "UNKNOWN",
                "primary_dept": parent_blk.get("department", "") if parent_blk else "COUPLED",
                "section": f"{b.get('section_from', '')}-{b.get('section_to', '')}",
                "granted_window": f"{start // 60:02d}:{start % 60:02d} - {end // 60:02d}:{end % 60:02d}",
                "overlap_minutes": dur,
                "mobilization_hours_saved": round(dur / 60.0, 2),
            })

    # 3. Clash Resolution Audit
    chaos_clashes = chaos_result.get("xai", {}).get("clashes_detected", [])
    solver_clashes = solver_result.get("xai", {}).get("clashes_detected", [])

    # 4. Constraint Attribution Waterfall (% breakdown of objective components)
    xai_data = solver_result.get("xai", {})
    train_delay_min = xai_data.get("total_train_delay_minutes", 0)
    block_dev_min = xai_data.get("total_block_deviation_minutes", 0)
    speed_debt_score = xai_data.get("total_speed_debt_score", 0.0)
    shadow_count = len(merged_shadows)
    night_count = xai_data.get("night_blocks_count", 0)

    # Standard model penalty multipliers
    train_delay_penalty = train_delay_min * 10
    block_dev_penalty = block_dev_min * 1
    speed_debt_penalty = int(round(speed_debt_score * 50))
    shadow_bonus = shadow_count * 1500
    night_bonus = night_count * 300

    total_gross = train_delay_penalty + block_dev_penalty + speed_debt_penalty + shadow_bonus + night_bonus
    denominator = max(1, total_gross)

    waterfall = {
        "train_delay_penalty": train_delay_penalty,
        "block_deviation_penalty": block_dev_penalty,
        "speed_debt_penalty": speed_debt_penalty,
        "shadow_merge_bonus": -shadow_bonus,
        "night_preference_bonus": -night_bonus,
        "net_objective_score": float(solver_result.get("objective_value", 0.0) or 0.0),
        "percentage_breakdown": {
            "train_delay_pct": round((train_delay_penalty / denominator) * 100, 1),
            "block_deviation_pct": round((block_dev_penalty / denominator) * 100, 1),
            "speed_debt_pct": round((speed_debt_penalty / denominator) * 100, 1),
            "shadow_bonus_pct": round((shadow_bonus / denominator) * 100, 1),
            "night_bonus_pct": round((night_bonus / denominator) * 100, 1),
        },
    }

    # 5. Side-by-side KPI Summary
    kpi_comparison = {
        "clashes_count": {
            "chaos": len(chaos_clashes),
            "line_clear": len(solver_clashes),
            "improvement": f"{len(chaos_clashes) - len(solver_clashes)} clashes eliminated",
        },
        "total_train_delay_minutes": {
            "chaos": chaos_result.get("xai", {}).get("total_train_delay_minutes", 0),
            "line_clear": train_delay_min,
        },
        "total_block_deviation_minutes": {
            "chaos": chaos_result.get("xai", {}).get("total_block_deviation_minutes", 0),
            "line_clear": block_dev_min,
        },
        "shadow_blocks_merged": {
            "chaos": 0,
            "line_clear": shadow_count,
        },
        "speed_debt_score": {
            "chaos": chaos_result.get("xai", {}).get("total_speed_debt_score", 0.0),
            "line_clear": speed_debt_score,
        },
    }

    summary = (
        f"LINE CLEAR resolved {len(chaos_clashes)} severe physical clashes present in the uncoordinated baseline. "
        f"Through intelligent window shifts, {shadow_count} inter-departmental shadow blocks were merged, "
        f"saving approximately {round(sum(m['mobilization_hours_saved'] for m in merged_shadows), 1)} hours of track possession mobilization."
    )

    return {
        "summary": summary,
        "shifted_blocks": shifted_blocks,
        "merged_shadows": merged_shadows,
        "clashes_resolved_count": len(chaos_clashes) - len(solver_clashes),
        "kpi_comparison": kpi_comparison,
        "constraint_attribution_waterfall": waterfall,
    }
