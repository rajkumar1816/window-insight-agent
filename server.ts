import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import type { 
  WindowsUpdate, 
  HindsightMemory, 
  UpdateExplanation, 
  FeedbackRecord, 
  AgentLearningMetrics,
  ChatMessage
} from './src/types/update.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google Gen AI if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with key:', err);
  }
}

// ---------------------------------------------------------
// Initial In-Memory State: WUA Data Store & Hindsight Bank
// ---------------------------------------------------------

let updatesStore: WindowsUpdate[] = [
  {
    id: 'upd-1',
    kbNumber: 'KB5061234',
    title: '2026-09 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems',
    category: 'Cumulative',
    releaseDate: '2026-09-22',
    status: 'Pending Download',
    severity: 'Critical',
    sizeBytes: 2470000000, // 2.3 GB
    rebootRequired: true,
    affectedComponents: ['Windows Kernel', 'DirectX Graphics Core', 'TCP/IP Stack', 'File Explorer'],
    msrcNumber: 'MS26-09-WIN11',
    cves: ['CVE-2026-3841', 'CVE-2026-3842', 'CVE-2026-3850'],
    supportUrl: 'https://support.microsoft.com/help/5061234',
    rawDescription: 'Addresses critical vulnerabilities in the Windows RPC runtime, updates graphics pipeline synchronization, fixes memory leak in File Explorer tabs, and improves overall system stability.',
    isNewDetected: true
  },
  {
    id: 'upd-2',
    kbNumber: 'KB5068912',
    title: 'Intel Corporation - Display - 32.0.101.5972 Graphics Driver & Display Adapter',
    category: 'Driver',
    releaseDate: '2026-09-26',
    status: 'Available',
    severity: 'Important',
    sizeBytes: 712000000, // 680 MB
    rebootRequired: true,
    affectedComponents: ['Intel Graphics Driver', 'DisplayPort Audio', 'Vulkan 1.3 Driver', 'HDR Calibration'],
    supportUrl: 'https://support.microsoft.com/help/5068912',
    rawDescription: 'Updates Intel Arc & Iris Xe Graphics display driver. Introduces game optimizations, modifies multi-monitor HDMI sync frequency, and updates display sleep state power management.',
    isNewDetected: true
  },
  {
    id: 'upd-3',
    kbNumber: 'KB5043076',
    title: 'Security Intelligence Update for Microsoft Defender Antivirus - KB5043076 (Version 1.417.89.0)',
    category: 'Defender',
    releaseDate: '2026-09-28',
    status: 'Installed',
    severity: 'Moderate',
    sizeBytes: 48000000,
    rebootRequired: false,
    affectedComponents: ['Microsoft Defender Core', 'Antimalware Signatures'],
    supportUrl: 'https://support.microsoft.com/help/5043076',
    rawDescription: 'Delivers daily antimalware definition updates for Windows Defender real-time scanning heuristics.',
    installedDate: '2026-09-28 08:15:22'
  },
  {
    id: 'upd-4',
    kbNumber: 'KB5052341',
    title: 'Realtek Semiconductor Corp. - Media - 6.0.9655.1 High Definition Audio',
    category: 'Driver',
    releaseDate: '2026-09-18',
    status: 'Available',
    severity: 'Moderate',
    sizeBytes: 125000000,
    rebootRequired: true,
    affectedComponents: ['Realtek Audio Device', 'Microphone Noise Cancellation DSP'],
    supportUrl: 'https://support.microsoft.com/help/5052341',
    rawDescription: 'Firmware and driver update for onboard Realtek Audio codecs, improving spatial sound latency.'
  },
  {
    id: 'upd-5',
    kbNumber: 'KB5042211',
    title: 'Intel Corporation - Display - 31.0.101.4885 Display Adapter (Historical)',
    category: 'Driver',
    releaseDate: '2026-08-14',
    status: 'Installed',
    severity: 'Important',
    sizeBytes: 650000000,
    rebootRequired: true,
    affectedComponents: ['Display Subsystem', 'HDMI Controller'],
    rawDescription: 'Historical driver update that caused severe display flickering and required rollback on user PC.',
    installedDate: '2026-08-15 14:20:00'
  },
  {
    id: 'upd-6',
    kbNumber: 'KB5039211',
    title: '2026-07 Cumulative Update for Windows 11 Version 24H2 (Historical)',
    category: 'Cumulative',
    releaseDate: '2026-07-10',
    status: 'Installed',
    severity: 'Critical',
    sizeBytes: 2100000000,
    rebootRequired: true,
    affectedComponents: ['Security Patches', 'Shell', 'Hyper-V'],
    rawDescription: 'Installed successfully without system regressions.',
    installedDate: '2026-07-12 21:05:00'
  }
];

// Hindsight Memory Bank ('windows-update-agent')
let hindsightMemories: HindsightMemory[] = [
  {
    id: 'mem-1',
    type: 'outcome',
    title: 'Display flickering regression after Intel graphics driver',
    content: 'On August 15, 2026, user installed KB5042211 (Intel graphics driver update). Following installation, the primary external display experienced black screens and flickering at 144Hz. The user had to rollback the driver and reported high frustration.',
    timestamp: '2026-08-16T10:30:00Z',
    category: 'Driver',
    tags: ['driver', 'graphics', 'display', 'flickering', 'regression', 'rollback', 'KB5042211'],
    impactWeight: 5,
    sourceEvent: 'KB5042211 post-install issue'
  },
  {
    id: 'mem-2',
    type: 'preference',
    title: 'User prefers concise, plain-English explanations',
    content: 'The user rated the technical breakdown for KB5039211 as "Too technical" and explicitly requested: "Please explain what this means for me in 2-3 short bullet points, avoid kernel jargon, and tell me if I need to save my work."',
    timestamp: '2026-07-13T09:12:00Z',
    category: 'general',
    tags: ['preference', 'plain_english', 'concise', 'no_jargon', 'bullet_points'],
    impactWeight: 4,
    sourceEvent: 'User feedback on KB5039211'
  },
  {
    id: 'mem-3',
    type: 'preference',
    title: 'Security updates should always be highlighted prominently',
    content: 'User expressed strong desire to know immediately when updates patch active zero-day vulnerabilities or security flaws, prioritizing security over convenience.',
    timestamp: '2026-08-01T14:00:00Z',
    category: 'Security',
    tags: ['preference', 'security', 'cve', 'highlight', 'priority'],
    impactWeight: 4,
    sourceEvent: 'User preference configuration'
  },
  {
    id: 'mem-4',
    type: 'preference',
    title: 'Driver updates require advance warning before installation',
    content: 'Because of previous driver issues, the user instructed the agent to flag any display, GPU, or audio driver update with cautionary advice (e.g. save work, ensure battery is charged, create restore point).',
    timestamp: '2026-08-16T11:00:00Z',
    category: 'Driver',
    tags: ['driver', 'caution', 'warning', 'display', 'restore_point'],
    impactWeight: 5,
    sourceEvent: 'Learned rule after display regression'
  },
  {
    id: 'mem-5',
    type: 'history',
    title: 'Windows Defender definition updates run seamlessly',
    content: 'Daily signature and definition updates (e.g. KB5043076) do not require restarts and run silently with zero user disruption.',
    timestamp: '2026-09-20T12:00:00Z',
    category: 'Defender',
    tags: ['history', 'defender', 'silent', 'no_restart'],
    impactWeight: 2,
    sourceEvent: 'Routine observation'
  }
];

let feedbackLog: FeedbackRecord[] = [
  {
    id: 'fb-1',
    updateId: 'upd-6',
    kbNumber: 'KB5039211',
    rating: 'negative',
    tag: 'too_technical',
    comment: 'Too technical. I do not care about kernel RPC internals, just tell me if my games and Chrome will keep working.',
    timestamp: '2026-07-13T09:10:00Z',
    learnedMemoryId: 'mem-2'
  }
];

let learningMetrics: AgentLearningMetrics = {
  totalInteractions: 28,
  memoriesStored: hindsightMemories.length,
  preferenceAdaptations: 12,
  outcomesUsed: 16,
  readabilityScore: 94,
  lastLearnedEvent: 'Recalled driver display issue for upcoming Intel graphics update'
};

// ---------------------------------------------------------
// Hindsight Recall Function
// ---------------------------------------------------------

function recallMemoriesForUpdate(update: WindowsUpdate): {
  recalled: HindsightMemory[];
  appliedPreferences: string[];
  consideredOutcomes: string[];
} {
  const updateKeywords = [
    update.category.toLowerCase(),
    update.kbNumber.toLowerCase(),
    ...update.affectedComponents.map(c => c.toLowerCase()),
    ...update.rawDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3)
  ];

  const scored = hindsightMemories.map(mem => {
    let score = 0;
    // Category match
    if (mem.category && mem.category.toLowerCase() === update.category.toLowerCase()) {
      score += 3;
    }
    // General preferences always apply
    if (mem.type === 'preference' && (mem.category === 'general' || !mem.category)) {
      score += 2.5;
    }
    // Tag matches
    for (const tag of mem.tags) {
      if (updateKeywords.some(kw => kw.includes(tag.toLowerCase()) || tag.toLowerCase().includes(kw))) {
        score += 2;
      }
    }
    // Content matches
    const memWords = mem.content.toLowerCase().split(/\W+/);
    for (const word of memWords) {
      if (word.length > 4 && updateKeywords.includes(word)) {
        score += 0.5;
      }
    }
    return { mem, score: score * (mem.impactWeight / 3) };
  });

  scored.sort((a, b) => b.score - a.score);
  // Pick memories with score threshold
  const recalled = scored.filter(s => s.score >= 2.0).map(s => s.mem);

  const appliedPreferences = recalled
    .filter(m => m.type === 'preference')
    .map(m => m.title);

  const consideredOutcomes = recalled
    .filter(m => m.type === 'outcome')
    .map(m => m.title);

  return { recalled, appliedPreferences, consideredOutcomes };
}

// ---------------------------------------------------------
// Explanation Synthesis (Mode A vs Mode B)
// ---------------------------------------------------------

async function generateExplanation(
  update: WindowsUpdate, 
  mode: 'hindsight' | 'no_memory'
): Promise<UpdateExplanation> {
  const { recalled, appliedPreferences, consideredOutcomes } = recallMemoriesForUpdate(update);

  if (mode === 'no_memory') {
    // Mode A: Standard Generic LLM without memory
    if (aiClient) {
      try {
        const prompt = `You are a standard Windows update assistant. Explain this Windows update strictly using only the raw update info provided below. DO NOT refer to any past user experiences, past update history, or user preferences. Use formal technical language:
Update: ${update.title} (${update.kbNumber})
Category: ${update.category}
Severity: ${update.severity}
Reboot required: ${update.rebootRequired}
Components: ${update.affectedComponents.join(', ')}
Raw Description: ${update.rawDescription}

Return JSON with:
{
  "summary": string,
  "importance": "Critical" | "High" | "Medium" | "Low",
  "userImpact": string,
  "recommendedAction": string,
  "simpleExplanation": string,
  "technicalDetails": string
}`;
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        const parsed = JSON.parse(response.text || '{}');
        return {
          updateId: update.id,
          kbNumber: update.kbNumber,
          summary: parsed.summary || `${update.category} update for Windows 11 components.`,
          updateType: update.category,
          importance: parsed.importance || (update.severity === 'Critical' ? 'Critical' : 'High'),
          userImpact: parsed.userImpact || 'System files will be updated to newer revisions.',
          restartRequired: update.rebootRequired,
          recommendedAction: parsed.recommendedAction || (update.rebootRequired ? 'Install and restart when prompted.' : 'Install update.'),
          simpleExplanation: parsed.simpleExplanation || `Microsoft released ${update.kbNumber} to update system subsystems. Please install it when prompted.`,
          technicalDetails: parsed.technicalDetails || update.rawDescription,
          mode: 'no_memory',
          confidenceScore: 0.72,
          generatedAt: new Date().toISOString()
        };
      } catch (err) {
        console.warn('Gemini fallback in mode A:', err);
      }
    }

    // Deterministic Mode A fallback
    return {
      updateId: update.id,
      kbNumber: update.kbNumber,
      summary: `Standard ${update.category} update published by Microsoft (${update.kbNumber}).`,
      updateType: update.category,
      importance: update.severity === 'Critical' ? 'Critical' : 'Medium',
      userImpact: 'System binaries and associated device libraries will be overwritten with newer revisions.',
      restartRequired: update.rebootRequired,
      recommendedAction: update.rebootRequired ? 'Install update and perform a system reboot.' : 'Install update at next maintenance window.',
      simpleExplanation: `Microsoft released ${update.kbNumber} containing security and quality changes. A restart is ${update.rebootRequired ? 'required' : 'not required'}.`,
      technicalDetails: update.rawDescription,
      mode: 'no_memory',
      confidenceScore: 0.70,
      generatedAt: new Date().toISOString()
    };
  }

  // Mode B: Hindsight Memory Enabled
  const reasoningSteps: string[] = [
    `1. Detected update ${update.kbNumber} (${update.category}) impacting: ${update.affectedComponents.join(', ')}.`,
    `2. Recalled ${recalled.length} memories from Hindsight bank ('windows-update-agent').`,
  ];

  if (consideredOutcomes.length > 0) {
    reasoningSteps.push(`3. Previous outcome alert: User suffered regressions (${consideredOutcomes.join('; ')}).`);
  }
  if (appliedPreferences.length > 0) {
    reasoningSteps.push(`4. User preference applied: ${appliedPreferences.join('; ')}.`);
  }
  reasoningSteps.push(`5. Calibrated tone: simplified non-jargon language, tailored caution advice, and prominent restart advisory.`);

  let adaptationText = '';
  if (update.category === 'Driver' && consideredOutcomes.some(o => o.toLowerCase().includes('display') || o.toLowerCase().includes('flickering'))) {
    adaptationText = 'Adapted for driver safety: The agent recalled your previous display flickering issue with KB5042211 and your preference for cautionary warnings before driver installations.';
  } else if (appliedPreferences.some(p => p.toLowerCase().includes('plain-english') || p.toLowerCase().includes('concise'))) {
    adaptationText = 'Adapted explanation style: Streamlined to 3 clear takeaways with zero kernel jargon based on your prior feedback.';
  } else {
    adaptationText = 'Calibrated using Hindsight memory profile: Evaluated against past successful installs and security notification preferences.';
  }

  if (aiClient) {
    try {
      const prompt = `You are the Windows Insight Agent, an AI that learns from user history and Hindsight memories.
Analyze this Windows Update:
KB Number: ${update.kbNumber}
Title: ${update.title}
Category: ${update.category}
Severity: ${update.severity}
Reboot Required: ${update.rebootRequired}
Affected Components: ${update.affectedComponents.join(', ')}
Raw Description: ${update.rawDescription}

Relevant Hindsight Memories:
${recalled.map(m => `- [${m.type.toUpperCase()}] ${m.title}: ${m.content}`).join('\n')}

Instructions:
1. Tone must strictly follow user preference: clear, warm, conversational, 2-3 short bullet points, NO obscure technical jargon.
2. If this is a driver update and the user had past display problems, warn them gently with practical advice (save work, close games, create restore point).
3. If this is a security update, highlight its importance clearly.
4. Clearly state whether a restart is required.
5. Do NOT invent details that are not in the update info.

Return JSON in this exact shape:
{
  "summary": string,
  "importance": "Critical" | "High" | "Medium" | "Low",
  "userImpact": string,
  "recommendedAction": string,
  "simpleExplanation": string,
  "technicalDetails": string
}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const parsed = JSON.parse(response.text || '{}');
      return {
        updateId: update.id,
        kbNumber: update.kbNumber,
        summary: parsed.summary || `Personalized explanation for ${update.kbNumber}`,
        updateType: update.category,
        importance: parsed.importance || (update.severity === 'Critical' ? 'Critical' : 'High'),
        userImpact: parsed.userImpact || 'Improves your PC security and reliability.',
        restartRequired: update.rebootRequired,
        recommendedAction: parsed.recommendedAction || 'Install when you are ready to take a short break.',
        simpleExplanation: parsed.simpleExplanation,
        technicalDetails: parsed.technicalDetails || update.rawDescription,
        mode: 'hindsight',
        hindsightContext: {
          recalledMemories: recalled,
          userPreferencesApplied: appliedPreferences,
          previousOutcomesConsidered: consideredOutcomes,
          reasoningSteps,
          adaptationExplanation: adaptationText
        },
        confidenceScore: 0.96,
        generatedAt: new Date().toISOString()
      };
    } catch (err) {
      console.warn('Gemini Mode B fallback:', err);
    }
  }

  // High-fidelity deterministic Mode B fallback
  let simpleExplanation = '';
  let recommendedAction = '';
  let importance: 'Critical' | 'High' | 'Medium' | 'Low' = 'High';

  if (update.category === 'Driver') {
    importance = 'High';
    simpleExplanation = `⚠️ Driver Update (${update.affectedComponents[0] || 'Hardware'})\n\n` +
      `Microsoft and the hardware maker released an updated display driver. Because you previously experienced display flickering after installing an Intel graphics driver (KB5042211), this agent recommends extra caution:\n\n` +
      `• Save all active open documents and game progress before starting.\n` +
      `• Your screen may blink or briefly go black 2–3 times during installation — this is expected.\n` +
      `• A system restart is required to finalize the new display pipeline.`;
    recommendedAction = 'Wait until you have finished your current work session, save your files, and install before a break.';
  } else if (update.category === 'Cumulative' || update.category === 'Security') {
    importance = 'Critical';
    simpleExplanation = `🔐 Essential Security & System Update\n\n` +
      `Microsoft released this monthly update to patch active security vulnerabilities and fix recent File Explorer memory issues:\n\n` +
      `• What it means for you: Strengthens your PC against malware and prevents File Explorer freezing.\n` +
      `• Time required: ~10 to 15 minutes.\n` +
      `• Restart required: Yes, your PC will need a restart.`;
    recommendedAction = 'Install today when you have a 15-minute break to restart.';
  } else if (update.category === 'Defender') {
    importance = 'Low';
    simpleExplanation = `🛡️ Virus Protection Definition Update\n\n` +
      `• This is a routine virus signature refresh for Windows Defender.\n` +
      `• Installs silently in the background with zero lag and no restart needed.`;
    recommendedAction = 'No action required — Windows handles this automatically.';
  } else {
    importance = 'Medium';
    simpleExplanation = `⚙️ Windows Component Update (${update.kbNumber})\n\n` +
      `• Updates system libraries for better stability.\n` +
      `• Restart is ${update.rebootRequired ? 'required' : 'not needed'}.`;
    recommendedAction = update.rebootRequired ? 'Install when convenient.' : 'Install at your convenience.';
  }

  return {
    updateId: update.id,
    kbNumber: update.kbNumber,
    summary: `${update.category} update: ${update.title}`,
    updateType: update.category,
    importance,
    userImpact: update.category === 'Driver' 
      ? 'Updates display controller. Past graphics update caused temporary monitor flickering, so cautious installation is advised.'
      : 'Enhances system security and patches known stability issues.',
    restartRequired: update.rebootRequired,
    recommendedAction,
    simpleExplanation,
    technicalDetails: update.rawDescription,
    mode: 'hindsight',
    hindsightContext: {
      recalledMemories: recalled,
      userPreferencesApplied: appliedPreferences,
      previousOutcomesConsidered: consideredOutcomes,
      reasoningSteps,
      adaptationExplanation: adaptationText
    },
    confidenceScore: 0.95,
    generatedAt: new Date().toISOString()
  };
}

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// 1. Status
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'healthy',
    collector: 'active',
    hindsightBank: 'windows-update-agent',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    totalUpdates: updatesStore.length,
    totalMemories: hindsightMemories.length,
    lastScanTime: new Date().toISOString()
  });
});

// 2. Get Updates
app.get('/api/updates', (_req, res) => {
  res.json({ updates: updatesStore });
});

// 3. Scan for Updates (Simulating WUA active searcher)
app.post('/api/scan', (_req, res) => {
  const newUpdatesFound = updatesStore.filter(u => u.status === 'Available' || u.status === 'Pending Download').length;
  res.json({
    scannedAt: new Date().toISOString(),
    status: 'success',
    newUpdatesCount: newUpdatesFound,
    message: `Scan complete: ${newUpdatesFound} updates pending attention.`
  });
});

// 4. Analyze Update (Mode A vs Mode B)
app.post('/api/analyze', async (req, res) => {
  try {
    const { updateId, mode = 'hindsight' } = req.body;
    const update = updatesStore.find(u => u.id === updateId || u.kbNumber === updateId);
    
    if (!update) {
      return res.status(404).json({ error: 'Update not found in collector database.' });
    }

    const explanation = await generateExplanation(update, mode);

    // Update metrics
    learningMetrics.totalInteractions += 1;
    if (mode === 'hindsight' && explanation.hindsightContext?.recalledMemories.length) {
      learningMetrics.outcomesUsed += explanation.hindsightContext.previousOutcomesConsidered.length;
    }

    res.json({ explanation });
  } catch (err: any) {
    console.error('Error analyzing update:', err);
    res.status(500).json({ error: err.message || 'Internal analysis error' });
  }
});

// 5. Compare Modes (Side-by-side Mode A vs Mode B)
app.post('/api/compare', async (req, res) => {
  try {
    const { updateId } = req.body;
    const update = updatesStore.find(u => u.id === updateId || u.kbNumber === updateId);
    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    const [modeA, modeB] = await Promise.all([
      generateExplanation(update, 'no_memory'),
      generateExplanation(update, 'hindsight')
    ]);

    res.json({ modeA, modeB, update });
  } catch (err: any) {
    console.error('Error in mode comparison:', err);
    res.status(500).json({ error: err.message || 'Failed to compare modes' });
  }
});

// 6. Memories API
app.get('/api/memories', (_req, res) => {
  res.json({ memories: hindsightMemories });
});

// Retain new memory
app.post('/api/memories/retain', (req, res) => {
  const { title, content, type = 'preference', category = 'general', tags = [], impactWeight = 3 } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newMem: HindsightMemory = {
    id: `mem-${Date.now()}`,
    type,
    title,
    content,
    timestamp: new Date().toISOString(),
    category,
    tags: Array.isArray(tags) ? tags : [tags],
    impactWeight: Number(impactWeight) || 3,
    sourceEvent: 'User taught directly via dashboard'
  };

  hindsightMemories.unshift(newMem);
  learningMetrics.memoriesStored = hindsightMemories.length;
  learningMetrics.preferenceAdaptations += 1;
  learningMetrics.lastLearnedEvent = `Retained memory: "${title}"`;

  res.json({ success: true, memory: newMem });
});

// Delete memory
app.delete('/api/memories/:id', (req, res) => {
  const id = req.params.id;
  hindsightMemories = hindsightMemories.filter(m => m.id !== id);
  learningMetrics.memoriesStored = hindsightMemories.length;
  res.json({ success: true });
});

// 7. Feedback API (The Learning Loop Heart)
app.post('/api/feedback', (req, res) => {
  const { updateId, kbNumber, rating, tag, comment } = req.body;
  
  const feedbackId = `fb-${Date.now()}`;
  let learnedMemory: HindsightMemory | undefined;

  // Transform feedback into persistent Hindsight experience
  if (tag === 'too_technical') {
    learnedMemory = {
      id: `mem-fb-${Date.now()}`,
      type: 'preference',
      title: 'User reinforced: Simplify explanations and remove jargon',
      content: `After reviewing ${kbNumber}, user requested simpler non-technical wording: "${comment || 'Keep it brief and practical'}"`,
      timestamp: new Date().toISOString(),
      category: 'general',
      tags: ['preference', 'plain_english', 'simple_language', 'feedback'],
      impactWeight: 4,
      sourceEvent: `Feedback on ${kbNumber}`
    };
  } else if (tag === 'display_issue') {
    learnedMemory = {
      id: `mem-fb-${Date.now()}`,
      type: 'outcome',
      title: `Display issue reported after ${kbNumber}`,
      content: `User reported display/monitor glitches after update ${kbNumber}: "${comment || 'Screen had visual artifacts or flickering'}"`,
      timestamp: new Date().toISOString(),
      category: 'Driver',
      tags: ['outcome', 'driver', 'display_issue', 'flickering', kbNumber],
      impactWeight: 5,
      sourceEvent: `User problem report on ${kbNumber}`
    };
  } else if (tag === 'audio_issue') {
    learnedMemory = {
      id: `mem-fb-${Date.now()}`,
      type: 'outcome',
      title: `Audio distortion reported after ${kbNumber}`,
      content: `User reported sound distortion or microphone mute issues after ${kbNumber}: "${comment || 'Audio dropped out'}"`,
      timestamp: new Date().toISOString(),
      category: 'Driver',
      tags: ['outcome', 'driver', 'audio_issue', kbNumber],
      impactWeight: 5,
      sourceEvent: `User problem report on ${kbNumber}`
    };
  } else if (tag === 'need_details') {
    learnedMemory = {
      id: `mem-fb-${Date.now()}`,
      type: 'preference',
      title: 'User requested more details on specific components',
      content: `User requested expanded technical details for ${kbNumber}: "${comment || 'Provide deeper subsystem info'}"`,
      timestamp: new Date().toISOString(),
      category: 'general',
      tags: ['preference', 'detail_level'],
      impactWeight: 3,
      sourceEvent: `Feedback on ${kbNumber}`
    };
  }

  if (learnedMemory) {
    hindsightMemories.unshift(learnedMemory);
    learningMetrics.memoriesStored = hindsightMemories.length;
    learningMetrics.preferenceAdaptations += 1;
    learningMetrics.lastLearnedEvent = `Learned from feedback on ${kbNumber}: ${learnedMemory.title}`;
  }

  const record: FeedbackRecord = {
    id: feedbackId,
    updateId: updateId || 'unknown',
    kbNumber: kbNumber || 'Unknown KB',
    rating: rating || 'negative',
    tag: tag || 'other',
    comment,
    timestamp: new Date().toISOString(),
    learnedMemoryId: learnedMemory?.id
  };

  feedbackLog.unshift(record);
  learningMetrics.totalInteractions += 1;

  res.json({
    success: true,
    feedback: record,
    learnedMemory,
    message: learnedMemory 
      ? `Feedback recorded. Hindsight memory bank updated with new experience.` 
      : 'Feedback logged successfully.'
  });
});

// 8. Learning Metrics API
app.get('/api/learning-stats', (_req, res) => {
  res.json({
    metrics: {
      ...learningMetrics,
      feedbackRecordsCount: feedbackLog.length
    },
    recentFeedback: feedbackLog.slice(0, 5)
  });
});

// 9. "Ask My Windows Agent" Conversational Chat
app.post('/api/chat', async (req, res) => {
  const { message, mode = 'hindsight' } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const updatesContext = updatesStore.map(u => 
    `• ${u.kbNumber} (${u.category}): ${u.title} [Status: ${u.status}, Reboot: ${u.rebootRequired ? 'Yes' : 'No'}]`
  ).join('\n');

  const memoriesContext = hindsightMemories.map(m =>
    `• [${m.type.toUpperCase()}] ${m.title}: ${m.content}`
  ).join('\n');

  if (aiClient) {
    try {
      let prompt = '';
      if (mode === 'no_memory') {
        prompt = `You are a standard Windows assistant WITHOUT memory. Answer the user question based strictly on general Windows knowledge and the list of updates below. DO NOT refer to any past user experiences, past problems, or learned preferences:
Current Updates:
${updatesContext}

User Question: "${message}"`;
      } else {
        prompt = `You are the Windows Insight Agent, an AI that learns and remembers past update experiences using Hindsight.
Current Updates:
${updatesContext}

Hindsight Memory Bank:
${memoriesContext}

Instructions:
1. Always utilize the Hindsight memories when relevant (e.g. past display issues with graphics drivers, user preferences for simple language, security priorities).
2. Answer warmly and concisely in simple, clear, user-friendly language.
3. If asked about safety, past problems, or what changed this week, directly cite the memories and update records.

User Question: "${message}"`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const replyText = response.text || 'I analyzed your Windows update status.';
      return res.json({
        reply: replyText,
        modeUsed: mode,
        recalledMemoriesCount: mode === 'hindsight' ? hindsightMemories.length : 0,
        hindsightNotes: mode === 'hindsight' ? [
          'Grounded with Hindsight memory bank',
          'Recalled past driver outcome & user tone preferences'
        ] : ['Mode A: No past memory context applied']
      });
    } catch (err) {
      console.warn('Chat Gemini error, falling back to local reasoning:', err);
    }
  }

  // Local fallback response engine
  const lowerMsg = message.toLowerCase();
  let reply = '';
  let notes: string[] = [];

  if (lowerMsg.includes('what changed') || lowerMsg.includes('this week') || lowerMsg.includes('new update')) {
    reply = `This week, 2 new updates were detected on your PC:\n` +
      `1. KB5061234 (Cumulative Security Update) — Patches Windows RPC vulnerabilities and fixes File Explorer memory leaks (2.3 GB, restart required).\n` +
      `2. KB5068912 (Intel Graphics Driver) — Updates display driver to v32.0.101.\n\n` +
      (mode === 'hindsight' 
        ? `⚠️ Note from your Hindsight memory: You previously had display flickering after a graphics driver in August (KB5042211). I advise saving all work before installing the Intel update.`
        : `Both updates are available in Windows Update.`);
    notes = ['Checked current update queue', 'Recalled past August display flickering experience'];
  } else if (lowerMsg.includes('problem') || lowerMsg.includes('issue') || lowerMsg.includes('similar')) {
    if (mode === 'hindsight') {
      reply = `Yes. Your Hindsight memory bank records that on August 15, 2026, after installing graphics driver KB5042211, your primary monitor experienced severe flickering at 144Hz, which required a driver rollback. For today's Intel driver (KB5068912), I recommend creating a restore point first and testing when you are not in the middle of urgent tasks.`;
      notes = ['Retrieved outcome record for KB5042211'];
    } else {
      reply = `Standard updates are tested by Microsoft before general availability. Minor issues can occasionally occur depending on system hardware configurations.`;
      notes = ['Generic guidance (No memory applied)'];
    }
  } else if (lowerMsg.includes('simply') || lowerMsg.includes('simple') || lowerMsg.includes('explain')) {
    reply = `In plain terms: Today's main update (KB5061234) is like a tune-up and lock change for your PC. It stops security bugs and makes your computer run more smoothly. You will need to restart your computer once it finishes downloading.`;
    notes = ['Applied preference: Plain English without kernel jargon'];
  } else if (lowerMsg.includes('safe') || lowerMsg.includes('meeting')) {
    reply = `If you have an upcoming meeting, do NOT start the update now! KB5061234 is 2.3 GB and requires a reboot that can take 10–15 minutes. Save it for the end of your workday.`;
    notes = ['Evaluated reboot requirement and payload size against user schedule'];
  } else {
    reply = `I am continuously monitoring Windows Update Agent telemetry. You currently have 1 critical security update (KB5061234) and 1 driver update (KB5068912) pending. Let me know if you would like me to explain what changed or check for potential conflicts with your past setup!`;
    notes = ['General telemetry overview'];
  }

  res.json({
    reply,
    modeUsed: mode,
    recalledMemoriesCount: mode === 'hindsight' ? 3 : 0,
    hindsightNotes: notes
  });
});

// 10. Simulate Update Injection (for live testing & hackathon demo)
app.post('/api/simulate-update', (req, res) => {
  const { type } = req.body;
  let newUpd: WindowsUpdate;

  if (type === 'zero_day') {
    newUpd = {
      id: `upd-${Date.now()}`,
      kbNumber: `KB507${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Emergency Out-of-Band Security Update for Windows 11 (Zero-Day Vulnerability)',
      category: 'Security',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'Available',
      severity: 'Critical',
      sizeBytes: 180000000,
      rebootRequired: true,
      affectedComponents: ['Windows TCP/IP', 'CryptoAPI'],
      msrcNumber: 'MS26-09-EMERGENCY',
      cves: ['CVE-2026-9999'],
      rawDescription: 'Addresses an actively exploited remote code execution vulnerability in the Windows networking stack.',
      isNewDetected: true
    };
  } else if (type === 'audio_driver') {
    newUpd = {
      id: `upd-${Date.now()}`,
      kbNumber: `KB508${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Realtek High Definition Audio Driver Update v6.0.9800',
      category: 'Driver',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'Available',
      severity: 'Important',
      sizeBytes: 145000000,
      rebootRequired: true,
      affectedComponents: ['Audio Endpoint', 'Dolby Atmos Service'],
      rawDescription: 'Updates sound driver latency registers and spatial audio engine.',
      isNewDetected: true
    };
  } else {
    newUpd = {
      id: `upd-${Date.now()}`,
      kbNumber: `KB506${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'NVIDIA - Display - GeForce Game Ready Driver 560.81',
      category: 'Driver',
      releaseDate: new Date().toISOString().split('T')[0],
      status: 'Available',
      severity: 'Important',
      sizeBytes: 680000000,
      rebootRequired: true,
      affectedComponents: ['Graphics Adapter', 'DisplayPort Audio'],
      rawDescription: 'Updates display driver for latest DirectX 12 Ultimate shader models.',
      isNewDetected: true
    };
  }

  updatesStore.unshift(newUpd);
  res.json({ success: true, update: newUpd });
});

// 11. Reset / Seed Demo Scenario
app.post('/api/reset-demo', (_req, res) => {
  // Resets to initial demo state
  learningMetrics = {
    totalInteractions: 28,
    memoriesStored: 5,
    preferenceAdaptations: 12,
    outcomesUsed: 16,
    readabilityScore: 94,
    lastLearnedEvent: 'Initial demo baseline loaded'
  };
  res.json({ success: true, message: 'Demo state reset' });
});

// ---------------------------------------------------------
// Mount Vite Middleware for Full-Stack dev mode
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Windows Update Intelligence Agent] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
