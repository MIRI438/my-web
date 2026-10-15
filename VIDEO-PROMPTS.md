# mir.ai — פרומפטים לסרטונים

כל הסרטונים צריכים להיראות כמו משפחה אחת. לכן:
1. **בתחילת כל פרומפט מדביקים את בלוק הסגנון** (למטה), ורק אחריו את הפרומפט של הסרטון.
2. **הלוגו מתווסף בעריכה**, לא נוצר ע"י ה-AI. כלי וידאו מעוותים לוגואים וטקסט. הפרומפטים משאירים מקום נקי ללוגו.
3. אם הכלי מאפשר להעלות תמונת רפרנס (Runway, Kling, Veo), מעלים את `assets/png/logo-on-cobalt.png` כדי שהכלי יתפוס את הצבע והסגנון.

## קבצי הלוגו
| קובץ | מתי משתמשים |
|---|---|
| `assets/png/logo-white-transparent.png` | לוגו לבן, רקע שקוף. **להנחה על כל סרטון** (פינה או סוף) |
| `assets/png/logo-on-cobalt.png` | לוגו על רקע כחול. **כרטיס סיום** של 2 שניות בסוף כל סרטון |
| `assets/png/logo-dark-transparent.png` | לוגו כהה, לרקעים בהירים |
| `assets/png/mark-white-transparent.png` | הסמל בלבד, לבן, שקוף. לפינה קטנה |
| `assets/png/mark-on-cobalt.png` | הסמל על כחול. תמונת פרופיל |

### איך מוסיפים את הלוגו (CapCut / Canva / Premiere)
- **סימן מים קבוע:** `mark-white-transparent.png`, פינה שמאלית תחתונה, רוחב 6% מהמסך, שקיפות 85%.
- **כרטיס סיום:** 2 שניות אחרונות, מעבר Fade ל-`logo-on-cobalt.png`. אותו כרטיס בכל הסרטונים.
- **צבע:** אם צריך טקסט בעריכה, רק לבן, בגופן IBM Plex Sans Hebrew (Bold).

---

## בלוק סגנון (מדביקים בתחילת כל פרומפט)

```
STYLE (mir.ai brand, keep identical across all videos):
Minimalist premium tech aesthetic. Strict palette: cobalt blue #2A3BFF as the
dominant flat background color, pure white #FFFFFF for all elements, and
near-black #0C0D10 only for depth and shadows. No other colors: no purple,
no neon, no rainbow, no gradients except subtle cobalt shading.
Visual language: tiny glowing white particles, thin white connection lines,
small round white nodes, an open white ring with a small white dot near its
gap (the brand symbol). Smooth, slow, calm motion with gentle easing;
slow forward camera drift; soft depth of field; clean 3D render look.
Lots of negative space. No text, no letters, no numbers, no logos,
no people, no faces, no hands, no UI screens with readable text.
24 fps, high quality, no flicker.
```

---

## 1. רקע לאתר — חלק "צור קשר" (לולאה)
**פורמט:** 16:9, ‏1920×1080, ‏8 שניות, בלי סאונד. **בלי לוגו** (זה רקע).

```
[STYLE BLOCK]

Seamless looping background. Thousands of tiny white particles slowly flow
along curved paths across a flat cobalt blue background and connect into
a calm network of thin white lines between small round nodes, like data
moving through an automated system. Particles gently brighten as they pass
each node. Keep the center and right side of the frame quiet and less
dense so text can sit on top. Very slow, hypnotic, continuous motion.
The first and last frame must match exactly for a perfect loop.
```

## 2. חשיפת לוגו — פתיח/סיום לכל הסרטונים
**פורמט:** ליצור פעמיים: 16:9 וגם 9:16. ‏5 שניות.
בעריכה: בשנייה 4 להניח מעל את `logo-white-transparent.png` במרכז, עם Fade.

```
[STYLE BLOCK]

Brand reveal. Scattered white particles drift in from the edges of a flat
cobalt blue frame, then smoothly converge at the center and assemble into
a clean open white ring with a small white dot floating near the gap of
the ring. The ring rotates slowly once and settles. Soft glow, gentle
camera push-in. The final 1.5 seconds hold still on the ring, perfectly
centered, with empty cobalt space to its right for a wordmark overlay.
```

## 3. רילס — "מכאוס לסדר" (מה זו אוטומציה)
**פורמט:** 9:16, ‏8 שניות. בעריכה: סמל בפינה + כרטיס סיום.

```
[STYLE BLOCK]

Vertical shot. Start: dozens of blank white paper sheets and sticky notes
float chaotically in mid-air against a near-black background, slowly
tumbling. Then a single cobalt blue pulse of light sweeps through the
frame and each paper dissolves into tiny white particles. The particles
reorganize into neat, orderly streams flowing upward along thin white
lines between round nodes, and the background transitions to flat cobalt
blue. Ends calm and organized, with clean empty space in the lower third.
```

## 4. רילס — "ליד נכנס" (הודעות לטלפון)
**פורמט:** 9:16, ‏6 שניות. בעריכה: סמל בפינה + כרטיס סיום.

```
[STYLE BLOCK]

Vertical close-up of a sleek modern smartphone floating at a slight angle
against a flat cobalt blue background, screen facing the camera, screen
glowing soft white with no readable content. A thin stream of white
particles flows into the phone from the top of the frame; each time it
arrives, a small soft white notification shape slides onto the screen and
a white ring pulses around the phone. Three arrivals, evenly paced.
Slow orbiting camera move. Clean, premium, calm.
```

---

### טיפים
- אם הכלי מוסיף טקסט או צבע סגול: להוסיף בסוף `Strictly no text. Only cobalt blue and white.` וליצור שוב.
- לבחור תמיד את הגרסה **הכי רגועה**. סרטון רקע לא צריך למשוך תשומת לב.
- לשלוח את ה-MP4 הסופי, ואני אדחוס ואטמיע אותו באתר.

---

# פרומפטים שמדגימים מערכות, בפירוט

## איך לכתוב אותם נכון
כלי וידאו (Veo, Sora, Runway, Kling) **לא יודעים לכתוב טקסט**, ובמיוחד לא בעברית. לכן כל ממשק בפרומפטים
מתואר עם "שורות אפורות" במקום טקסט, ואת הטקסט (שמות, כותרות) מוסיפים בעריכה ב-CapCut/Canva.
כל פרומפט בנוי כ**תסריט של שוטים עם זמנים**, כדי שהכלי יבין בדיוק מה קורה בכל שנייה.

מדביקים את **בלוק הסגנון** (למעלה) + את **בלוק הממשק** (כאן) בתחילת כל פרומפט:

```
UI STYLE (keep identical across all system videos):
Clean modern SaaS interface, light theme: white cards, very light grey
background #F6F6F4, thin hairline borders, soft shadows, 12px rounded
corners. Accent color cobalt blue #2A3BFF only for buttons and highlights,
green #22C55E only for check marks. All text in the UI is shown as
abstract grey placeholder lines and blocks of different lengths, never as
readable letters. Smooth, satisfying micro-animations, ease-out motion,
like a premium product launch video. Shot as a crisp screen-level
close-up, slight 3D perspective tilt, shallow depth of field at the edges.
No readable text, no logos, no people, no hands, no cursor arrow.
```

---

## 5. כרטיס לקוח שממלא את עצמו (CRM)
**פורמט:** 16:9, ‏8 שניות. **בעריכה:** להוסיף כותרת "כרטיס לקוח נפתח לבד".

```
[STYLE BLOCK] [UI STYLE]

8-second product shot of a CRM customer card on a laptop screen, camera
slowly pushing in with a slight tilt.
0-1s: an empty white card slides up into the center of the screen; inside
it, grey shimmering skeleton placeholders where a round avatar, a name
line, a phone line and a message box will be.
1-3s: the placeholders fill in one after another from top to bottom: the
avatar becomes a solid cobalt circle, the grey lines turn into dark
crisp lines, each field flashes with a soft yellow highlight as it fills.
3-5s: a semicircle gauge on the side of the card sweeps from empty to
almost full in orange; a small pill label pops in next to it.
5-7s: at the bottom of the card, a checklist of four rows ticks itself:
each row's empty circle becomes a green check with a small bounce.
7-8s: a row of five dots under the card fills left to right in cobalt,
then hold on the complete card.
```

## 6. לוח לידים שזז לבד (Pipeline)
**פורמט:** 16:9, ‏8 שניות. **בעריכה:** שמות עמודות: חדש · ענינו · פגישה · הצעה · לקוח.

```
[STYLE BLOCK] [UI STYLE]

Wide shot of a kanban sales pipeline with five vertical columns on a large
monitor, each column topped by a short grey header line.
0-2s: new small white cards drop into the first column one by one with a
soft bounce, each with a tiny colored dot on its corner.
2-6s: cards automatically glide sideways from column to column, smoothly,
never overlapping, as if pulled by an invisible hand; each time a card
lands in a new column, a thin cobalt glow pulses around it.
6-8s: one card reaches the last column and turns solid cobalt with a white
check mark; a subtle confetti of tiny white particles bursts from it.
Slow lateral camera drift from right to left across the board.
```

## 7. תשובה אוטומטית בוואטסאפ
**פורמט:** 9:16, ‏6 שניות. לרילס. **בעריכה:** "תשובה תוך 4 שניות".

```
[STYLE BLOCK]

Vertical close-up of a modern smartphone floating at a slight angle on a
flat cobalt blue background. The screen shows a messaging app with a dark
teal header bar and a beige chat background; all message text is shown
as abstract grey lines, never readable letters.
0-1.5s: a light green incoming message bubble slides in from the side.
1.5-3s: three small grey typing dots pulse in a white bubble.
3-4.5s: the typing dots turn into a white reply bubble containing grey
lines and one small blue link line; two tiny blue check marks appear.
4.5-6s: a soft white ring pulses outward from the phone; camera slowly
orbits a few degrees. Clean, premium, calm.
```

## 8. בונה תהליכים (כמו Make / n8n)
**פורמט:** 16:9, ‏8 שניות. מתאים כרקע לחלק "מה אנחנו בונים".

```
[STYLE BLOCK] [UI STYLE]

Top-down view of a visual automation builder canvas: a light dotted grid
background. Round white nodes with simple line icons inside (envelope,
chat bubble, calendar, document, person) are connected by thin curved
grey wires, laid out left to right in a branching flow.
0-2s: nodes appear one by one with a small pop, wires draw themselves
between them.
2-6s: small glowing cobalt dots travel along the wires from the first node
through the branches, and each node briefly lights up cobalt and shows a
tiny green check badge as a dot passes through it.
6-8s: all nodes are checked, the whole flow glows softly, slow camera
pull-back to reveal the full workflow.
```

## 9. דשבורד שמתעדכן לבד
**פורמט:** 16:9, ‏8 שניות. **בעריכה:** "כל המספרים במקום אחד".

```
[STYLE BLOCK] [UI STYLE]

Laptop screen with a business dashboard: four small stat cards across the
top (each a big dark number-shaped block and a grey line), a large bar
chart in the middle, and a line chart on the side.
0-3s: bars grow upward one after another with a smooth spring motion,
cobalt bars with one darker highlighted bar.
3-6s: the line chart draws itself from left to right with a glowing dot
at its tip; the stat cards gently flip as if their values update.
6-8s: a small notification card slides in at the corner with a green
check; slow camera push-in toward the main chart.
```

## 10. חשבונית שנשלחת לבד
**פורמט:** 9:16, ‏6 שניות. לרילס. **בעריכה:** "עסקה נסגרה = חשבונית נשלחה".

```
[STYLE BLOCK]

Vertical shot on a flat cobalt blue background. Left: a laptop showing a
white document with grey lines and a small red badge in its corner
(a PDF). Right: a smartphone with a chat screen.
0-2s: on the laptop, a cobalt button-shaped block is pressed, the document
lifts off the screen as a floating white paper card.
2-4s: the paper card flies in a smooth arc across the frame, leaving a
short trail of white particles, and lands inside the phone's chat as a
small file attachment bubble.
4-6s: two tiny blue check marks appear under it, a soft green check badge
pops above the phone. Calm, satisfying, premium.
```

### טיפים לסרטוני מערכות
- אם הכלי בכל זאת כותב אותיות: להוסיף בסוף `All UI text must be abstract grey lines. No letters.`
- אם המסך יוצא עמוס: להוסיף `Minimal UI, lots of white space, only the elements described.`
- הכי טוב לבקש **5–8 שניות** לכל סרטון. תסריט ארוך יותר נוטה להתפרק.
- הטקסט בעברית (שמות, כותרות) מתווסף בעריכה, בגופן IBM Plex Sans Hebrew, בלבן או בכחול #2A3BFF.
