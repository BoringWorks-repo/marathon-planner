// src/components/PaceWidget.tsx
import React, { useEffect, useMemo, useState } from "react";
import IMask from "imask";
import { IMaskInput } from "react-imask";
import { setPaces } from "../paceStore";

// ---- helpers (same style you had) ----
function timeToSeconds(t: string): number | null {
    if (!t) return null;
    const parts = t.trim().split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return null;

    if (parts.length === 3) {
        const [h, m, s] = parts;
        return h * 3600 + m * 60 + s;
    } else if (parts.length === 2) {
        const [m, s] = parts;
        return m * 60 + s;
    }
    return null;
}

function secondsToPaceString(sec: number): string {
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
}

type Units = "mi" | "km";

type PaceWidgetProps = {
    /** Comes from the existing Units buttons on the page */
    units: Units;
    isPfitz: boolean;
};
const PaceWidget: React.FC<PaceWidgetProps> = ({ units, isPfitz }) => {
    // Input is **Goal Marathon Time** (HH:MM:SS)
    const [goalMarathonTime, setGoalMarathonTime] = useState("00:00:00");


    const result = useMemo(() => {
        const total = timeToSeconds(goalMarathonTime);
        if (!total || total <= 0) return null;

        // Convert marathon time -> base pace per selected unit
        const marathonMiles = 26.2;
        const marathonKm = 42.195;
        const basePaceSeconds =
            units === "mi" ? total / marathonMiles : total / marathonKm;
        // MP = base pace
        const MP = secondsToPaceString(basePaceSeconds);

        // GA range = 1.15×base to 1.25×base (15–25% slower)
        const GA_lo = secondsToPaceString(1.15 * basePaceSeconds);
        const GA_hi = secondsToPaceString(1.25 * basePaceSeconds);

        // LT range = 0.91×base to 0.94×base (6–9% faster)
        const LT_lo = secondsToPaceString(0.91 * basePaceSeconds);
        const LT_hi = secondsToPaceString(0.94 * basePaceSeconds);

        const LR_lo = secondsToPaceString(1.1 * basePaceSeconds);
        const LR_hi = secondsToPaceString(1.2 * basePaceSeconds);


        return {
            MP,
            GA: `${GA_lo} to ${GA_hi}`,
            LT: `${LT_lo} to ${LT_hi}`,
            LR: `${LR_lo} to ${LR_hi}`,
        };
    }, [goalMarathonTime, units]);

    const unitLabel = units === "mi" ? "min/mi" : "min/km";

    useEffect(() => {
        // derive total seconds directly from the input field
        const total = timeToSeconds(goalMarathonTime);

        // If the user hasn't entered a real time, clear the store so nothing renders
        if (!total || total <= 0 || !result) {
            setPaces(null);
            return;
        }

        if (result) {
            setPaces({
                unit: units,
                unitLabel,
                MP: result.MP,
                LT: result.LT,
                GA: result.GA,
                LR: result.LR,
            });
        }
    }, [result, units, unitLabel]);

    return (
        <>
            {/* Keep your existing header/rows/classes */}
            <div className="pace-calculator-content">
                <div className="second-toolbar-item">
                    <h4><strong className="header-word">Pace Calculator</strong></h4>
                </div>

                <div className="units">
                    <label>
                        Goal Marathon Time (HH:MM:SS){" "}
                        <IMaskInput
                            mask="HH:mm:ss"
                            blocks={{
                                HH: { mask: IMask.MaskedRange, from: 0, to: 99, maxLength: 2 },
                                mm: { mask: IMask.MaskedRange, from: 0, to: 59, maxLength: 2 },
                                ss: { mask: IMask.MaskedRange, from: 0, to: 59, maxLength: 2 },
                            }}
                            lazy={false}
                            placeholderChar="0"
                            overwrite={true}
                            value={goalMarathonTime}
                            onAccept={(val) => setGoalMarathonTime(String(val))}
                            className="app-input"
                        />

                    </label>
                </div>

                {result ? (
                    <div className="units pace-line">
                        <div className="pace-label"><strong>Marathon Pace:</strong></div>
                        <div className="pace-value">{result.MP} {unitLabel}</div>
                        {isPfitz && (<>
                            <div className="pace-label"><strong>Lactic Threshold:</strong></div>
                            <div className="pace-value">{result.LT} {unitLabel}</div>

                            <div className="pace-label"><strong>Gen Aerobic:</strong></div>
                            <div className="pace-value">{result.GA} {unitLabel}</div>

                            <div className="pace-label"><strong>(Med) Long Run:</strong></div>
                            <div className="pace-value">{result.LR} {unitLabel}</div>

                        </>
                        )}

                    </div>
                ) : null}
            </div>
        </>
    );
};

export default PaceWidget;
