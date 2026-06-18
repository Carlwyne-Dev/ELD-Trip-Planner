import React, { useRef, useEffect } from 'react';

export default function LogCanvas({ dayData, isDark = true, driverName = '', carrierName = '', origin = '', destination = '', canvasRef: externalRef }) {
    const internalRef = useRef(null);
    const canvasRef = externalRef || internalRef;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !dayData) return;
        const ctx = canvas.getContext('2d');

        // Canvas size
        const W = 1000;
        const H = 560;
        const dpr = window.devicePixelRatio || 2;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${W}px`;
        canvas.style.height = `${H}px`;

        // Theme colors
        const BG      = isDark ? '#111111' : '#ffffff';
        const CARD_BG = isDark ? '#141414' : '#f8fafc';
        const FG      = isDark ? '#cccccc' : '#0f172a';
        const DIM     = isDark ? '#555555' : '#94a3b8';
        const BORDER  = isDark ? '#2a2a2a' : '#cbd5e1';
        const HDR_BG  = isDark ? '#000000' : '#111111'; // Classic paper log black banner
        const AMBER   = '#F59E0B';
        const GRID_LN = isDark ? '#2a2a2a' : '#e2e8f0';
        const GRID_MJ = isDark ? '#333333' : '#94a3b8';

        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, W, H);

        // ── Helpers ─────────────────────────────────────────────────────────
        const hline = (x1, y1, x2, y2, w = 1, color = BORDER) => {
            ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = w;
            ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        };
        const fillR = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
        const text = (str, x, y, font, color, align = 'left', baseline = 'middle') => {
            ctx.font = font; ctx.fillStyle = color;
            ctx.textAlign = align; ctx.textBaseline = baseline;
            ctx.fillText(str, x, y);
        };

        // ── HEADER SECTION ──────────────────────────────────────────────────
        const HH = 72; // header height
        fillR(0, 0, W, HH, CARD_BG);
        hline(0, HH, W, HH, 1, BORDER);

        // Date
        const [yr, mo, dy] = (dayData.date || '2026-06-16').split('-');
        const dateStr = `${mo} / ${dy} / ${yr}`;
        text("Driver's Daily Log", 16, 20, 'bold 16px "Inter",sans-serif', FG, 'left', 'top');
        text('(24 hours)', 16, 38, '10px "Inter",sans-serif', DIM, 'left', 'top');
        text(`Date: ${dateStr}`, 16, 55, 'bold 12px "JetBrains Mono",monospace', AMBER, 'left', 'top');

        // From / To
        text('From:', 200, 22, 'bold 10px "Inter",sans-serif', DIM, 'left', 'top');
        text(origin || '', 245, 22, 'bold 12px "JetBrains Mono",monospace', FG, 'left', 'top');
        hline(245, 33, 500, 33, 0.5, BORDER);
        
        text('To:', 510, 22, 'bold 10px "Inter",sans-serif', DIM, 'left', 'top');
        text(destination || '', 535, 22, 'bold 12px "JetBrains Mono",monospace', FG, 'left', 'top');
        hline(535, 33, 780, 33, 0.5, BORDER);

        // Driver / Carrier
        text(driverName || 'Driver Name', 200, 45, 'bold 12px "JetBrains Mono",monospace', FG, 'left', 'top');
        text(carrierName || 'Carrier', 510, 45, '11px "JetBrains Mono",monospace', DIM, 'left', 'top');

        // Total Miles right
        text(`Total Miles Driving Today: ${Math.round(dayData.total_miles_driven || 0)}`, W - 16, 22, 'bold 11px "Inter",sans-serif', DIM, 'right', 'top');
        text('Day ' + (dayData.day || 1), W - 16, 38, 'bold 22px "Bebas Neue","Inter",sans-serif', AMBER, 'right', 'top');

        // ── GRID SETUP ──────────────────────────────────────────────────────
        const LBL_W  = 110;   // left label area
        const TOT_W  = 65;    // right totals area
        const GX     = LBL_W;
        const GY     = HH + 28;
        const GW     = W - LBL_W - TOT_W;
        const ROW_H  = 40;
        const ROWS   = 4;
        const HDR_H  = 24;
        const HOUR_W = GW / 24;

        // ── HOUR HEADER ─────────────────────────────────────────────────────
        fillR(GX, GY - HDR_H, GW + TOT_W, HDR_H, HDR_BG);
        hline(GX, GY - HDR_H, GX + GW + TOT_W, GY - HDR_H, 1, BORDER);
        hline(GX, GY, GX + GW + TOT_W, GY, 1, BORDER);

        const HOUR_LBLS = [
            'Midnight','1','2','3','4','5','6','7','8','9','10','11',
            'NOON','13','14','15','16','17','18','19','20','21','22','23','Midnight'
        ];
        HOUR_LBLS.forEach((lbl, i) => {
            const x = GX + i * HOUR_W;
            if (lbl.includes('\n')) {
                const [a, b] = lbl.split('\n');
                text(a, x, GY - HDR_H + 7,  '7px "Inter",sans-serif', '#ffffff', 'center', 'top');
                text(b, x, GY - HDR_H + 16, '7px "Inter",sans-serif', '#ffffff', 'center', 'top');
            } else {
                text(lbl, x, GY - HDR_H / 2, `${lbl.length > 2 ? '9' : '10'}px "Inter",sans-serif`, '#ffffff', 'center', 'middle');
            }
        });

        // Total Hours header
        text('Total', GX + GW + TOT_W / 2, GY - HDR_H + 7,  '8px "Inter",sans-serif', '#ffffff', 'center', 'top');
        text('Hours', GX + GW + TOT_W / 2, GY - HDR_H + 16, '8px "Inter",sans-serif', '#ffffff', 'center', 'top');

        const TICK_CLR  = isDark ? '#555555' : '#888888'; // 15-min / 45-min tick
        const TICK_MJ   = isDark ? '#777777' : '#444444'; // 30-min tick (bolder)
        const LINE_CLR  = isDark ? '#3a3a3a' : '#777777'; // hour column lines

        // Alternating row backgrounds
        for (let r = 0; r < ROWS; r++) {
            const rowBg = r % 2 === 0
                ? (isDark ? '#0d0d0d' : '#f8f8f8')
                : (isDark ? '#111111' : '#eeeeee');
            fillR(GX, GY + r * ROW_H, GW, ROW_H, rowBg);
        }

        // Outer rect
        ctx.strokeStyle = isDark ? '#555' : '#555'; ctx.lineWidth = 2;
        ctx.strokeRect(GX + 0.5, GY + 0.5, GW, ROWS * ROW_H);
        ctx.strokeRect(GX + GW + 0.5, GY + 0.5, TOT_W, ROWS * ROW_H);

        // Row dividers
        for (let r = 1; r < ROWS; r++) {
            hline(GX, GY + r * ROW_H, GX + GW + TOT_W, GY + r * ROW_H, 1.5, isDark ? '#444' : '#888');
        }

        // Hour verticals + ruler tick marks inside each row
        for (let h = 0; h <= 24; h++) {
            const x = GX + h * HOUR_W;
            const isNoon = h === 12;
            const isMajor = h % 6 === 0 || isNoon;
            // Full-height hour column lines
            hline(x, GY, x, GY + ROWS * ROW_H, isMajor ? 1.5 : 1.0, isMajor ? (isDark ? '#666' : '#444') : LINE_CLR);

            if (h < 24) {
                for (let r = 0; r < ROWS; r++) {
                    const ry  = GY + r * ROW_H;
                    const rh  = ROW_H;
                    // 15-min (short: ~22% of row from top AND bottom)
                    const t15 = rh * 0.22;
                    hline(x + HOUR_W * 0.25, ry,       x + HOUR_W * 0.25, ry + t15,      1.0, TICK_CLR);
                    hline(x + HOUR_W * 0.25, ry + rh,  x + HOUR_W * 0.25, ry + rh - t15, 1.0, TICK_CLR);
                    // 30-min (medium: ~45% of row from top AND bottom)
                    const t30 = rh * 0.45;
                    hline(x + HOUR_W * 0.5,  ry,       x + HOUR_W * 0.5,  ry + t30,      1.4, TICK_MJ);
                    hline(x + HOUR_W * 0.5,  ry + rh,  x + HOUR_W * 0.5,  ry + rh - t30, 1.4, TICK_MJ);
                    // 45-min (short: ~22% of row from top AND bottom)
                    hline(x + HOUR_W * 0.75, ry,       x + HOUR_W * 0.75, ry + t15,      1.0, TICK_CLR);
                    hline(x + HOUR_W * 0.75, ry + rh,  x + HOUR_W * 0.75, ry + rh - t15, 1.0, TICK_CLR);
                }
            }
        }

        // ── ROW LABELS ──────────────────────────────────────────────────────
        const ROW_LBLS = [
            { top: '1. OFF DUTY', bot: null },
            { top: '2. SLEEPER', bot: 'BERTH' },
            { top: '3. DRIVING', bot: null },
            { top: '4. ON DUTY', bot: '(NOT DRIVING)' },
        ];
        ROW_LBLS.forEach(({ top, bot }, i) => {
            const midY = GY + i * ROW_H + ROW_H / 2;
            if (bot) {
                text(top, LBL_W - 8, midY - 6, 'bold 10px "Inter",sans-serif', FG, 'right');
                text(bot, LBL_W - 8, midY + 7, '8px "Inter",sans-serif', DIM, 'right');
            } else {
                text(top, LBL_W - 8, midY, 'bold 10px "Inter",sans-serif', FG, 'right');
            }
        });

        // ── PARSE & DRAW STATUS LINE ─────────────────────────────────────────
        const toH = (t) => {
            const [hh, mm] = (t || '00:00').split(':').map(Number);
            return Math.min(hh + mm / 60, 24);
        };
        const ROW_MAP = { OFF_DUTY: 0, SLEEPER_BERTH: 1, DRIVING: 2, ON_DUTY_NOT_DRIVING: 3 };
        const totals = [0, 0, 0, 0];

        // Draw the amber status line — strict right-angle corners only
        ctx.save();
        ctx.strokeStyle = AMBER;
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'miter';
        ctx.beginPath();

        let lastX = null;
        let lastY = null;
        let started = false;

        dayData.segments.forEach(seg => {
            const r  = ROW_MAP[seg.status] ?? 0;
            totals[r] += seg.duration_hours;
            const x1 = GX + toH(seg.start_time) * HOUR_W;
            const x2 = GX + toH(seg.end_time)   * HOUR_W;
            const y  = GY + r * ROW_H + ROW_H / 2;

            if (!started) {
                // First segment: start at (x1, y)
                ctx.moveTo(x1, y);
                started = true;
            } else {
                // Step 1: always go horizontally to x1 at previous row height (fill any gap)
                ctx.lineTo(x1, lastY);
                // Step 2: if row changed, go vertically to new row (strict right angle)
                if (lastY !== y) {
                    ctx.lineTo(x1, y);
                }
            }

            // Step 3: draw horizontal segment to the right
            ctx.lineTo(x2, y);
            lastX = x2;
            lastY = y;
        });

        ctx.stroke();
        ctx.restore();

        // ── RIGHT TOTALS ─────────────────────────────────────────────────────
        const grandTotal = totals.reduce((a, b) => a + b, 0);
        totals.forEach((t, i) => {
            if (t > 0) {
                text(t.toFixed(1), GX + GW + TOT_W / 2, GY + i * ROW_H + ROW_H / 2,
                    'bold 13px "JetBrains Mono",monospace', AMBER, 'center');
            }
        });

        // Grand total bar
        fillR(GX + GW, GY + ROWS * ROW_H + 2, TOT_W, 24, HDR_BG);
        text(grandTotal.toFixed(1), GX + GW + TOT_W / 2, GY + ROWS * ROW_H + 14,
            'bold 14px "JetBrains Mono",monospace', AMBER, 'center');
        text('TOTAL HRS', GX + GW + TOT_W / 2, GY + ROWS * ROW_H + 30,
            '7px "Inter",sans-serif', DIM, 'center', 'top');

        // ── REMARKS ZONE ─────────────────────────────────────────────────────
        const GRID_BOTTOM_Y = GY + ROWS * ROW_H;
        hline(GX, GRID_BOTTOM_Y + 8, GX + GW, GRID_BOTTOM_Y + 8, 0.5, BORDER);
        text('REMARKS', 8, GRID_BOTTOM_Y + 12, 'bold 10px "Inter",sans-serif', DIM, 'left', 'top');

        // Build event brackets (grouping contiguous non-driving statuses)
        const brackets = [];
        let currentBracket = null;

        dayData.segments.forEach((seg) => {
            if (seg.status === 'DRIVING') {
                if (currentBracket) {
                    currentBracket.endH = Math.min(24, currentBracket.startH + currentBracket.dur);
                    brackets.push(currentBracket);
                    currentBracket = null;
                }
            } else {
                const sH = toH(seg.start_time);
                if (!currentBracket) {
                    currentBracket = {
                        status: seg.status,
                        startH: sH,
                        dur: seg.duration_hours,
                        location: seg.location,
                        remarks: seg.remarks
                    };
                } else if (currentBracket.status === seg.status && currentBracket.remarks === seg.remarks) {
                    currentBracket.dur += seg.duration_hours;
                } else {
                    currentBracket.endH = Math.min(24, currentBracket.startH + currentBracket.dur);
                    brackets.push(currentBracket);
                    currentBracket = {
                        status: seg.status,
                        startH: sH,
                        dur: seg.duration_hours,
                        location: seg.location,
                        remarks: seg.remarks
                    };
                }
            }
        });
        if (currentBracket) {
            currentBracket.endH = Math.min(24, currentBracket.startH + currentBracket.dur);
            brackets.push(currentBracket);
        }

        const BRACKET_Y = GRID_BOTTOM_Y + 30; // Horizontal connector bar sits 30px below grid

        let lastCx = -999;
        let staggerLevel = 0;

        ctx.save();
        brackets.forEach((b) => {
            // Filter out routine/daily events that clutter the logbook
            const ignored = ['Off Duty', 'mandatory rest', 'cycle restart'];
            if (!b.remarks || ignored.some(i => b.remarks.includes(i))) return;

            const sx1 = GX + b.startH * HOUR_W;
            const sx2 = GX + b.endH   * HOUR_W;
            const cx  = (sx1 + sx2) / 2;

            // Stagger if too close to the previous remark to prevent overlapping text
            if (cx - lastCx < 40) {
                staggerLevel = (staggerLevel + 1) % 3; // Up to 3 levels
            } else {
                staggerLevel = 0;
            }
            lastCx = cx;

            const extraDrop = staggerLevel * 40;

            const lineColor = isDark ? '#cccccc' : '#111111';

            ctx.save();
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();

            // Left drop
            ctx.moveTo(sx1, GRID_BOTTOM_Y);
            ctx.lineTo(sx1, BRACKET_Y);
            // Right drop
            ctx.moveTo(sx2, GRID_BOTTOM_Y);
            ctx.lineTo(sx2, BRACKET_Y);
            // Horizontal connector
            ctx.moveTo(sx1, BRACKET_Y);
            ctx.lineTo(sx2, BRACKET_Y);
            // Center tick + angled leader line (fixed X offset, variable Y drop for perpendicular text separation)
            ctx.moveTo(cx, BRACKET_Y);
            ctx.lineTo(cx - 18, BRACKET_Y + 18 + extraDrop);
            
            ctx.stroke();
            ctx.restore();

            // Remarks text — rotated -45 deg
            const loc    = (b.location || '').length > 40 ? b.location.slice(0, 40) + '…' : (b.location || '');
            const remark = (b.remarks  || '').length > 40 ? b.remarks.slice(0, 40)  + '…' : (b.remarks  || '');

            ctx.save();
            // Anchor at the bottom tip of the leader line, shifted slightly so it doesn't touch the line
            ctx.translate(cx - 18 - 4, BRACKET_Y + 18 + extraDrop + 4);
            ctx.rotate(-Math.PI / 4); // 45 degrees
            
            // Anchor RIGHT so text grows down-and-left, away from the grid and future brackets
            text(loc,    0, -5, 'bold 10px "Inter",sans-serif', FG,    'right', 'bottom');
            text(remark, 0,  5, '9px "Inter",sans-serif',       AMBER, 'right', 'top');
            ctx.restore();
        });
        ctx.restore();

    }, [dayData, isDark, driverName, carrierName, origin, destination, canvasRef]);

    return (
        <div className="thick-scrollbar" style={{ overflowX: 'auto', width: '100%', background: isDark ? '#111111' : '#ffffff' }}>
            <div style={{ minWidth: 900 }}>
                <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
        </div>
    );
}
