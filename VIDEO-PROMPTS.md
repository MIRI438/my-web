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
