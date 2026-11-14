// Exam specs for Sam's practice modes. Each spec feeds the AI system prompt, the timers and the score tag.
// Formats and criterion NAMES are facts taken from the official pages in `src`; every rubric detail below is
// paraphrased. Never put official test items, sample answers or rubric wording in this public repo.
// Timings are per item: prepS / speakS (seconds), minutes for writing; n = items in a full official set.
window.SAM_DATA = window.SAM_DATA || {};
(function () {
  // Shared rule prepended to every task instruction.
  var O = 'Create ORIGINAL items only (never reuse official test questions or sample answers). Give ONE item at a time and wait for the answer. ';
  var CARD = 'Call the tool show_card with the EXACT target text (nothing else on the card), say nothing else, and let the learner read it; the app scores word accuracy by comparing the transcript with the card, so do NOT invent an accuracy number yourself, just give one short tip on delivery (stress, linking, pausing) after each item. ';
  var REP = 'Speak the sentence ONCE, clearly, at natural native pace, with nothing before or after it (no "repeat after me" on the same turn), then wait; the app compares the transcript with your sentence word by word, so do NOT invent an accuracy number, just note any missing or changed words. ';

  window.SAM_DATA.exams = {
    ielts_gt: {
      name: 'IELTS General Training',
      scale: { min: 0, max: 9, step: 0.5, label: 'band 0–9' },
      note: 'Dùng cho định cư, làm việc, học nghề (Úc, Canada, New Zealand, Anh); điểm Sam chấm chỉ là ước lượng để luyện, không phải điểm chính thức.',
      speaking: [
        { id: 'p1', name: 'Part 1 — Introduction & interview', n: 10, prepS: 0, speakS: 30, mode: 'call',
          how: O + 'Act as the examiner. Brief ID check, then about 10 short questions on 2–3 everyday topics (home, work or study, routines, hobbies), about 4–5 minutes in total. No fixed per-answer limit; 30 s is a soft guide. Do not correct or teach during the part.' },
        { id: 'p2', name: 'Part 2 — Long turn (cue card)', n: 1, prepS: 60, speakS: 120, mode: 'call',
          how: O + 'Call show_card with an original cue card: a "Describe a …" topic plus 3–4 "You should say" prompts and a final "and explain …" line. Allow 1 minute to prepare (notes allowed), then let them speak 1–2 minutes without interrupting; stop them at 2 minutes. Ask one or two brief rounding-off questions.' },
        { id: 'p3', name: 'Part 3 — Discussion', n: 5, prepS: 0, speakS: 60, mode: 'call',
          how: O + 'Ask 4–6 abstract follow-up questions linked to the Part 2 theme (causes, comparisons, the future, society), about 4–5 minutes. Push for reasons and examples; ask a short follow-up if an answer is thin.' }
      ],
      writing: [
        { id: 't1', name: 'Task 1 — Letter', minutes: 20, words: '150+',
          how: O + 'Write an original letter situation with 3 bullet points to cover, and say whether the tone is formal, semi-formal or informal. Begin with "Dear …,". Mark: are all 3 bullets covered with enough detail, is the purpose clear, is the tone consistent with the reader; organisation and linking; vocabulary; grammar. Penalise under 150 words.' },
        { id: 't2', name: 'Task 2 — Essay', minutes: 40, words: '250+',
          how: O + 'Write an original everyday-topic essay question (opinion, discussion, problem–solution, advantages–disadvantages or two-part). Mark: is every part of the question answered with a clear position and developed ideas; paragraphing and cohesion; vocabulary range and precision; grammar range and accuracy. Penalise under 250 words. Task 2 counts double Task 1.' }
      ],
      criteria: {
        speaking: ['Fluency and Coherence', 'Lexical Resource', 'Grammatical Range and Accuracy', 'Pronunciation'],
        writing: ['Task Achievement (T1) / Task Response (T2)', 'Coherence and Cohesion', 'Lexical Resource', 'Grammatical Range and Accuracy']
      },
      scoreTag: '<score2>{"exam":"ielts_gt","skill":"Speaking|Writing","task":"<task id or full>","overall":N,"range":[lo,hi],"crit":{"TA":N,"CC":N,"LR":N,"GRA":N}}</score2> — for Speaking use crit {"FC":N,"LR":N,"GRA":N,"P":N}; all values are bands 0–9 in 0.5 steps.',
      src: [
        'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-writing',
        'https://ielts.org/take-a-test/test-types/ielts-general-training-test/ielts-general-training-format-speaking',
        'https://ielts.org/take-a-test/test-types/ielts-general-training-test',
        'https://ielts.org/organisations/ielts-for-organisations/ielts-scoring-in-detail'
      ]
    },

    toefl: {
      name: 'TOEFL iBT (2026)',
      scale: { min: 1, max: 6, step: 0.5, label: '1–6' },
      note: 'Thi vào đại học, chủ yếu Mỹ và châu Á (định dạng mới từ 21/01/2026, thang 1–6); điểm Sam chấm chỉ là ước lượng, không phải điểm chính thức.',
      speaking: [
        { id: 'repeat', name: 'Listen and Repeat', n: 7, prepS: 0, speakS: 10, mode: 'repeat',
          how: O + 'Set a short campus scene in one line (e.g. a guide showing new students around a library). Then give 7 sentences that belong to that scene, getting longer and more complex (about 5 words up to 15–20 words). Response window is 8–12 s, longer for later sentences. ' + REP },
        { id: 'interview', name: 'Take an Interview', n: 4, prepS: 0, speakS: 45, mode: 'call',
          how: O + 'Play a friendly interviewer in an original situation (scholarship application, research study, campus job). Ask 4 questions, 45 s each, no preparation time: start with factual or personal-experience questions and end with opinion questions on a broader issue. No follow-ups or teaching between questions.' }
      ],
      writing: [
        { id: 'build', name: 'Build a Sentence', minutes: 6, words: '10 items (scrambled reply)',
          how: O + 'Show one natural sentence from speaker A, then speaker B\'s reply as scrambled words or chunks (one or two chunks may already be fixed). The learner types the reply in the right order. Exactly one correct order; mark each right or wrong and explain the rule (question word order, adverb position, etc.). About 6 minutes for 10 items (approximate: the official 23-minute section also holds the two tasks below).' },
        { id: 'email', name: 'Write an Email', minutes: 7, words: 'no official minimum; aim ~100',
          how: O + 'Give an original academic or social scenario and the email\'s goal (recommend, invite, complain politely, propose a solution) with 3 points to address. Score 0–5: does it achieve the goal with enough elaboration on all points; is the tone and politeness right for the reader; range and precision of grammar and word choice; errors and mechanics (spelling, punctuation, capitals).' },
        { id: 'discussion', name: 'Write for an Academic Discussion', minutes: 10, words: '100+',
          how: O + 'Write an original professor post framing a topic and asking an opinion question, then two short student posts that take different sides (give the students names). The learner adds their own position with reasons. Score 0–5: a clear position that adds something beyond the two students; support and development; coherence; grammar and vocabulary range and accuracy; mechanics.' }
      ],
      criteria: {
        speaking: ['Accuracy of repetition (Listen and Repeat)', 'Relevance and elaboration', 'Pace and pausing', 'Pronunciation and intonation', 'Grammar and vocabulary range'],
        writing: ['Task purpose achieved', 'Elaboration and support', 'Register and social conventions', 'Grammar and vocabulary range', 'Accuracy and mechanics']
      },
      scoreTag: '<score2>{"exam":"toefl","skill":"Speaking|Writing","task":"<task id or full>","overall":N,"range":[lo,hi],"crit":{"task":N,"elaboration":N,"language":N,"accuracy":N}}</score2> — crit are task scores 0–5 (Speaking crit {"content":N,"delivery":N,"language":N}); overall/range are on the 1–6 band in 0.5 steps.',
      src: [
        'https://www.eu.ets.org/pdfs/toefl/toefl-ibt-test-overview.pdf',
        'https://www.eu.ets.org/pdfs/toefl/toefl-ibt-test-specifications-2026.pdf',
        'https://www.in.ets.org/toefl/institutions/ibt/about/content-structure',
        'https://www.in.ets.org/content/dam/ets-org/pdfs/toefl/score-scale-update-2026.pdf'
      ]
    },

    pte: {
      name: 'PTE Academic / PTE Core',
      scale: { min: 10, max: 90, step: 1, label: '10–90' },
      note: 'PTE Academic cho du học và visa Úc/New Zealand/Anh; PTE Core cho định cư và làm việc ở Canada; điểm Sam chấm chỉ là ước lượng (phát âm, độ trôi chảy càng khó đo), không phải điểm chính thức.',
      speaking: [
        { id: 'read_aloud', name: 'Read Aloud', n: 6, prepS: 35, speakS: 40, mode: 'readAloud',
          how: O + 'Write an original academic-style text of 40–60 words. ' + CARD + 'Allow 30–40 s to read silently, then up to about 40 s to read aloud. Every word on the card counts, and only those words.' },
        { id: 'repeat_sentence', name: 'Repeat Sentence', n: 10, prepS: 0, speakS: 15, mode: 'repeat',
          how: O + 'Give an original academic or campus sentence lasting 3–9 s when spoken (about 8–18 words). ' + REP + 'The learner has 15 s and hears it only once.' },
        { id: 'describe_image', name: 'Describe Image', n: 5, prepS: 25, speakS: 40, mode: 'call',
          how: O + 'Call show_card with an original simple chart, table, process or map described as text or a small data table (title, axes or labels, 4–6 data points). 25 s to look, 40 s to speak: overview, key figures, comparison, conclusion.' },
        { id: 'retell_lecture', name: 'Retell Lecture', n: 2, prepS: 10, speakS: 40, mode: 'call',
          how: O + 'Speak an original mini-lecture of 60–90 s on an academic topic, clearly, once. Then 10 s to prepare and 40 s to retell the main idea, key points and their links in the learner\'s own words.' },
        { id: 'short_question', name: 'Answer Short Question', n: 5, prepS: 0, speakS: 10, mode: 'call',
          how: O + 'Ask an original general-knowledge question that has a one-word or very short answer. 10 s to answer; mark right or wrong.' },
        { id: 'group_discussion', name: 'Summarize Group Discussion', n: 1, prepS: 10, speakS: 120, mode: 'call',
          how: O + 'Voice an original discussion of 2–3 minutes between three named speakers with different views on one topic (label each turn with the speaker name). Then 10 s to prepare and 2 minutes to summarise the topic, each speaker\'s view and any agreement, paraphrased.' },
        { id: 'respond_situation', name: 'Respond to a Situation', n: 2, prepS: 10, speakS: 40, mode: 'call',
          how: O + 'Call show_card with an original everyday situation of up to 60 words that ends with what the learner must do, and read it aloud once. 10 s to prepare (20 s in PTE Core), 40 s to respond in character. Mark content and how appropriate the tone is.' }
      ],
      writing: [
        { id: 'swt', name: 'Summarize Written Text', minutes: 10, words: 'Academic: ONE sentence, 5–75 · Core: 25–50',
          how: O + 'Give an original passage (Academic up to 300 words, Core up to 200). Academic: the summary must be one complete sentence of 5–75 words; Core: 25–50 words. Mark content (main points kept), form (length and sentence rule), grammar, vocabulary.' },
        { id: 'essay', name: 'Write Essay (Academic)', minutes: 20, words: '200–300',
          how: O + 'Give an original 2–3 sentence argumentative prompt. Mark content, development and structure, form (200–300 words), general linguistic range, grammar, vocabulary range, spelling.' },
        { id: 'email', name: 'Write Email (Core)', minutes: 9, words: '50–120 (aim 80–120)',
          how: O + 'Give an original everyday email task of up to 100 words with the recipient and 3 points to cover. Mark content, email conventions (greeting, purpose, sign-off, tone), form (length), organisation, grammar and mechanics, vocabulary range, spelling.' }
      ],
      criteria: {
        speaking: ['Content', 'Oral fluency', 'Pronunciation', 'Appropriacy (Respond to a Situation)'],
        writing: ['Content', 'Form', 'Development, structure and coherence', 'General linguistic range', 'Grammar usage and mechanics', 'Vocabulary range', 'Spelling', 'Email conventions (Core)']
      },
      scoreTag: '<score2>{"exam":"pte","skill":"Speaking|Writing","task":"<task id or full>","overall":N,"range":[lo,hi],"crit":{"content":N,"fluency":N,"pronunciation":N}}</score2> — for Writing use crit {"content":N,"form":N,"grammar":N,"vocabulary":N,"spelling":N}; all values on the 10–90 scale.',
      src: [
        'https://www.pearsonpte.com/pte-academic/test-format/speaking-writing',
        'https://www.pearsonpte.com/pte-academic/test-format/speaking',
        'https://www.pearsonpte.com/pte-core/test-format/speaking-writing',
        'https://www.pearsonpte.com/articles/pte-changes-2025-everything-you-need-to-know'
      ]
    },

    det: {
      name: 'Duolingo English Test',
      scale: { min: 10, max: 160, step: 5, label: '10–160' },
      note: 'Thi online tại nhà, rẻ và có kết quả nhanh, nhiều trường Mỹ/Canada/Anh nhận để xét tuyển (không dùng cho visa Úc hay SELT Anh); điểm Sam chấm chỉ là ước lượng, không phải điểm chính thức.',
      speaking: [
        { id: 'speak_photo', name: 'Speak About the Photo', n: 1, prepS: 20, speakS: 90, mode: 'call',
          how: O + 'Sam has no photos: call show_card with a vivid 2–3 sentence description of an original everyday scene (people, place, action) standing in for the photo. 20 s to look, then up to 90 s to describe it in detail.' },
        { id: 'read_then_speak', name: 'Read Then Speak', n: 1, prepS: 20, speakS: 90, mode: 'call',
          how: O + 'Call show_card with an original question plus 2–3 bullet sub-questions (personal experience or opinion). 20 s to prepare, up to 90 s to speak; the card stays visible.' },
        { id: 'interactive_speaking', name: 'Interactive Speaking', n: 7, prepS: 0, speakS: 35, mode: 'call',
          how: O + 'Ask 6–8 short spoken questions on two topics (3–4 each). Each follow-up must react to what the learner just said and get harder if they answered well, easier if they struggled. Up to 35 s per answer, the question is heard only once.' },
        { id: 'speaking_sample', name: 'Speaking Sample', n: 1, prepS: 30, speakS: 180, mode: 'call',
          how: O + 'Call show_card with an original open question (describe, explain or give an opinion). Up to 30 s to read, then up to 3 minutes to speak.' }
      ],
      writing: [
        { id: 'write_photo', name: 'Write About the Photo', minutes: 1, words: 'no official minimum; 1–3 good sentences',
          how: O + 'Call show_card with a short text description of an original scene in place of a photo. 1 minute to write a description of it; 3 items in a full set.' },
        { id: 'interactive_writing', name: 'Interactive Writing', minutes: 8, words: 'no official minimum; aim ~100 + ~50',
          how: O + 'Step 1: an original question (social issue, personal experience or abstract idea); up to 30 s to think, 5 minutes to write. Step 2: a second question on the same topic about an angle Step 1 did not cover; 3 minutes, no prep. Score both together; Step 2 must connect to Step 1.' },
        { id: 'summarize_conversation', name: 'Summarize the Conversation', minutes: 1.25, words: 'short summary (75 s)',
          how: O + 'Voice an original 1–2 minute campus conversation (student–professor or student–student), then give 75 s to type a summary. Content shows how much they understood.' },
        { id: 'writing_sample', name: 'Writing Sample', minutes: 5, words: 'no official minimum; aim ~100+',
          how: O + 'Give an original prompt (describe, personal experience or opinion). Up to 30 s to think, 5 minutes to type.' }
      ],
      criteria: {
        speaking: ['Content', 'Discourse coherence', 'Fluency', 'Grammar', 'Lexis', 'Pronunciation'],
        writing: ['Content', 'Discourse coherence', 'Grammar', 'Lexis']
      },
      scoreTag: '<score2>{"exam":"det","skill":"Speaking|Writing","task":"<task id or full>","overall":N,"range":[lo,hi],"crit":{"content":N,"coherence":N,"grammar":N,"lexis":N}}</score2> — for Speaking add "fluency":N,"pronunciation":N; all values on the 10–160 scale in steps of 5.',
      src: [
        'https://englishtest-static.duolingo.com/media/resources/DET_Scoring%20Guide%20for%20Teachers%20(2026).pdf',
        'https://englishtest-static.duolingo.com/media/resources/Questions%20Guide%202026.pdf',
        'https://blog.englishtest.duolingo.com/interactive-speaking'
      ]
    }
  };
})();
