/**
 * ALTER EGO - High-DPI Card Generator
 * Produces an ultra-crisp, stylized PNG collector card on an HTML5 canvas.
 */

export function generateAlterEgoCard(result) {
  return new Promise((resolve, reject) => {
    try {
      const width = 1200;
      const height = 1650;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const { archetype, characterName, title, universeDesignation, meta, breakdown } = result;

      // 1. Base Dark Cosmic Gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#060511');
      bgGrad.addColorStop(0.4, '#0c0a22');
      bgGrad.addColorStop(0.8, '#120c2a');
      bgGrad.addColorStop(1, '#05030e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Nebulae Glows
      const drawGlow = (x, y, radius, color) => {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
        glow.addColorStop(0, color);
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      drawGlow(width * 0.2, height * 0.15, 500, meta.glowColor || 'rgba(192, 132, 252, 0.25)');
      drawGlow(width * 0.85, height * 0.45, 600, 'rgba(56, 189, 248, 0.2)');
      drawGlow(width * 0.5, height * 0.85, 650, 'rgba(236, 72, 153, 0.18)');

      // 3. Stardust particles on card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 160; i++) {
        const sx = (Math.sin(i * 99 + 17) * 0.5 + 0.5) * (width - 80) + 40;
        const sy = (Math.cos(i * 47 + 31) * 0.5 + 0.5) * (height - 80) + 40;
        const sr = ((i % 5) + 1) * 0.6;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Glassmorphic Card Container Border
      const pad = 50;
      const cornerR = 36;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad, pad, width - pad * 2, height - pad * 2, cornerR);
      ctx.lineWidth = 2.5;
      const borderGrad = ctx.createLinearGradient(pad, pad, width - pad, height - pad);
      borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      borderGrad.addColorStop(0.5, meta.color || 'rgba(192, 132, 252, 0.6)');
      borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.strokeStyle = borderGrad;
      ctx.stroke();

      // Inner subtle glow border
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeRect(pad + 12, pad + 12, width - (pad + 12) * 2, height - (pad + 12) * 2);
      ctx.restore();

      // 5. Header Branding
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '600 18px "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.letterSpacing = '6px';
      ctx.fillText('ALTER EGO MULTIVERSE ARCHIVE', pad + 50, pad + 70);

      // Universe serial tag top-right
      ctx.textAlign = 'right';
      ctx.fillStyle = meta.color || '#38bdf8';
      ctx.font = '700 20px "Space Grotesk", monospace, sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(universeDesignation || 'UNIVERSE #000-OMEGA', width - pad - 50, pad + 70);

      // Decorative divider
      ctx.beginPath();
      ctx.moveTo(pad + 50, pad + 95);
      ctx.lineTo(width - pad - 50, pad + 95);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 6. Character Name & Archetype Pill
      const mainY = pad + 180;
      ctx.textAlign = 'left';

      // Archetype Badge Pill
      const pillX = pad + 50;
      const pillY = mainY - 35;
      const pillText = `✦  ${archetype}`;
      ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
      const textMetrics = ctx.measureText(pillText);
      const pillWidth = textMetrics.width + 44;
      const pillHeight = 44;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 22);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = meta.color || '#c084fc';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(pillText, pillX + 22, pillY + 30);
      ctx.restore();

      // Character Name
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '-0.5px';
      ctx.fillText(characterName, pad + 50, mainY + 70);

      // Traits subtitle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(meta.traits, pad + 52, mainY + 115);

      // 7. Signature Quote Box (Glass banner)
      const quoteBoxY = mainY + 155;
      const boxW = width - (pad + 50) * 2;
      const boxH = 125;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(pad + 50, quoteBoxY, boxW, boxH, 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Quote text
      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'italic 500 23px "Plus Jakarta Sans", serif';
      wrapText(ctx, meta.signatureQuote, pad + 80, quoteBoxY + 50, boxW - 60, 36);
      ctx.restore();

      // 8. Storylore ("In another universe, you...")
      const storyY = quoteBoxY + boxH + 45;
      ctx.fillStyle = meta.color || '#38bdf8';
      ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('IN ANOTHER UNIVERSE...', pad + 50, storyY);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.font = '400 22px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '0px';
      wrapText(ctx, meta.inAnotherUniverse, pad + 50, storyY + 40, boxW, 34);

      // 9. Trait Matrix Grid (2 Columns x 2 Rows)
      const gridY = storyY + 180;
      const colW = (boxW - 30) / 2;
      const rowH = 100;

      const traits = [
        { label: 'CORE STRENGTH', val: meta.coreStrength, icon: '✦' },
        { label: 'SUPERPOWER', val: meta.superpower, icon: '⚡' },
        { label: 'HIDDEN TRAIT', val: meta.hiddenTrait, icon: '👁' },
        { label: 'AESTHETIC', val: meta.aesthetic, icon: '◈' }
      ];

      traits.forEach((t, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const tx = pad + 50 + col * (colW + 30);
        const ty = gridY + row * (rowH + 20);

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(tx, ty, colW, rowH, 16);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '2px';
        ctx.fillText(`${t.icon}  ${t.label}`, tx + 20, ty + 32);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 19px "Plus Jakarta Sans", sans-serif';
        ctx.letterSpacing = '0px';
        wrapText(ctx, t.val, tx + 20, ty + 62, colW - 40, 24, 2);
        ctx.restore();
      });

      // 10. Archetype Breakdown Percentages (Mini Bars)
      const barsY = gridY + 250;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '3px';
      ctx.fillText('COSMIC ARCHETYPE RESONANCE BREAKDOWN', pad + 50, barsY);

      if (breakdown) {
        const archetypes = Object.keys(breakdown);
        const barColW = (boxW - 40) / 3;
        archetypes.forEach((archKey, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const bx = pad + 50 + col * (barColW + 20);
          const by = barsY + 25 + row * 45;
          const pct = breakdown[archKey]?.percentage || 0;

          // Label
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
          ctx.letterSpacing = '0.5px';
          const shortName = archKey.replace('THE ', '');
          ctx.fillText(shortName, bx, by + 14);

          ctx.textAlign = 'right';
          ctx.fillStyle = archKey === archetype ? (meta.color || '#38bdf8') : 'rgba(255, 255, 255, 0.5)';
          ctx.fillText(`${pct}%`, bx + barColW, by + 14);
          ctx.textAlign = 'left';

          // Track
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.fillRect(bx, by + 22, barColW, 7);

          // Fill
          ctx.fillStyle = archKey === archetype ? (meta.color || '#c084fc') : 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(bx, by + 22, (barColW * pct) / 100, 7);
        });
      }

      // 11. Footer / Verification Watermark
      const footerY = height - pad - 45;
      ctx.beginPath();
      ctx.moveTo(pad + 50, footerY - 25);
      ctx.lineTo(width - pad - 50, footerY - 25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '1px';
      ctx.fillText('ALTER EGO  ✦  AUTHENTICATED PARALLEL CONSCIOUSNESS', pad + 50, footerY);

      ctx.textAlign = 'right';
      ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), width - pad - 50, footerY);

      // Convert to blob / data URL
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          resolve(canvas.toDataURL('image/png'));
        }
      }, 'image/png');

    } catch (err) {
      reject(err);
    }
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 10) {
  if (!text) return;
  const words = text.split(' ');
  let line = '';
  let linesCount = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line, x, y);
      line = words[n] + ' ';
      y += lineHeight;
      linesCount++;
      if (linesCount >= maxLines - 1 && n < words.length - 1) {
        ctx.fillText(line.trim() + '...', x, y);
        return;
      }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
