import { QuestionConfig } from './types';
import {
    User, Activity, Zap, Pill, MoreHorizontal,
    Check, X, AlertCircle, Moon, Users,
    Briefcase, Car, Armchair, PersonStanding,
    Move, Clock, DollarSign, Shield, ThumbsUp, Frown, HelpCircle,
    Syringe, HeartHandshake
} from 'lucide-react';
import { FaWalking } from "react-icons/fa";
import { GiWeightLiftingUp } from "react-icons/gi";
import { FaHeadSideCough } from "react-icons/fa6";
import HerniatedDisc from './components/icons/HerniatedDisc';
import Sciatica from './components/icons/Sciatica';
import BulgingDisc from './components/icons/BulgingDisc';
import DegenerativeDisc from './components/icons/DegenerativeDisc';
import SpinalStenosis from './components/icons/SpinalStenosis';
import Sleep from './components/icons/Sleep';
import Age20 from './components/icons/Age20';
import Age30 from './components/icons/Age30';
import Age45 from './components/icons/Age45';
import Age55 from './components/icons/Age55';
import StickBack from './components/icons/StickBack';
import Age20F from './components/icons/Age20F';
import Age30F from './components/icons/Age30F';
import Age40F from './components/icons/Age40F';
import Age60F from './components/icons/Age60F';

import StandingIcon from './components/icons/StandingIcon';
import { ChiropracticIcon } from './components/icons/ChiropracticIcon';
import SurgeryIcon from './components/icons/SurgeryIcon';
import SocialProofIcon from './components/icons/SocialProofIcon';
import SpinalRehabIcon from './components/icons/SpinalRehabIcon';
import ActivityGoalIcon from './components/icons/ActivityGoalIcon';
import { PhysicalTherapyIcon } from './components/icons/PhysicalTherapyIcon';

// Sections for the Header Progress Bar
export const PROGRESS_SECTIONS = [
    { id: 'profile', label: 'Profile' },
    { id: 'spine', label: 'Spine' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'plan', label: 'Plan' }
];

export const QUIZ_CONFIG: QuestionConfig[] = [
    // ============================================
    // SECTION 1: PROFILE
    // ============================================

    // Q1: Gender (also serves as start screen)
    {
        id: 'gender',
        section: 'profile',
        theme: 'light',
        type: 'gender-landing',
        question: "Check Your Fit for Non-Surgical Spinal Decompression",
        subtext: "We'll compare your situation with clinical patterns commonly seen in patients who improve. Personalized insights in under 90 seconds.",
        autoAdvance: true,
        options: [
            { value: 'male', label: 'Male', image: 'https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/d8b4c17c-2fbb-421b-3286-f0b458b82a00/public' },
            { value: 'female', label: 'Female', image: 'https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/cc3b2ad8-4a2e-420e-d5d5-1ef3bf24c000/public' },
        ],
        next: 'age'
    },

    // Q2: Age Range
    {
        id: 'age',
        section: 'profile',
        theme: 'light',
        type: 'picture-tiles',
        question: "What's your age range?",
        autoAdvance: true,
        componentProps: {
            conditionalImages: {
                male: {
                    '18-34': Age20,
                    '35-49': Age30,
                    '50-64': Age45,
                    '65+': Age55
                },
                female: {
                    '18-34': Age20F,
                    '35-49': Age30F,
                    '50-64': Age40F,
                    '65+': Age60F
                }
            }
        },
        options: [
            { value: '18-34', label: '18–34', image: 'https://images.unsplash.com/photo-1520342868574-5fa3804e551c?auto=format&fit=crop&q=80&w=400&h=400' },
            { value: '35-49', label: '35–49', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400' },
            { value: '50-64', label: '50–64', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400' },
            { value: '65+', label: '65+', image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&q=80&w=400&h=400' },
        ],
        next: 'pain-regions'
    },

    {
        id: 'pain-regions',
        section: 'profile',
        theme: 'light',
        type: 'body-map',
        question: "What is causing you the most discomfort?",
        subtext: "(select all that apply)",
        multiSelect: true,
        componentProps: {
            image: 'https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/31559b2d-771f-4b70-855d-f8b90c9fdc00/public'
        },
        options: [
            { value: 'Neck', label: 'Neck' },
            { value: 'Arm / Shoulder', label: 'Arm / Shoulder' },
            { value: 'Back', label: 'Back' },
            { value: 'Buttocks / Leg', label: 'Buttocks / Leg' },
        ],
        next: (answers) => {
            const regions = answers['pain-regions'] || [];

            // Check for Distal-Only Patterns (Requested Logic)
            const hasNeck = regions.includes('Neck');
            const hasArm = regions.includes('Arm / Shoulder');
            const hasBack = regions.includes('Back');
            const hasLeg = regions.includes('Buttocks / Leg');

            // Pattern A: Arm/Shoulder ONLY (without Neck)
            if (hasArm && !hasNeck && !hasBack && !hasLeg) return 'pain-origin';
            // OR just standard Distal-Only check regardless of other regions? 
            // Requirement: "Arm / Shoulder is selected AND Neck is NOT selected"
            // Implies if they selected Back as well, it might be ambiguous?
            // "Some users select ONLY: Arm / Shoulder (without Neck)"
            // STRICT INTERPRETATION: If Arm is present and Neck is missing -> Ambiguous origin for that arm pain.
            // However, multi-select lets them pick Back + Arm.
            // Let's stick to the prompt's implied cases which are "distal without proximal".
            // Case 1: Arm AND !Neck
            if (hasArm && !hasNeck) return 'pain-origin';
            // Case 2: Buttock/Leg AND !Back
            if (hasLeg && !hasBack) return 'pain-origin';

            return regions.length >= 2 ? 'primary-region' : 'radiating-pain';
        }
    },

    // Q4: Primary Region (conditional - only if 2+ regions selected)
    {
        id: 'primary-region',
        section: 'profile',
        theme: 'light',
        type: 'full-buttons',
        question: "Which area bothers you the most?",
        autoAdvance: true,
        options: [], // Will be populated dynamically from Q3 selections
        componentProps: { dynamicFromPrevious: 'pain-regions' }, // Fixed key
        next: (answers) => {
            // Re-check for distal-only patterns even after primary selection if we want to be safe, 
            // BUT the prompt implies this clarification happens 'After' body map. 
            // If they went to primary-region, they selected 2+. 
            // If they selected Neck + Arm, they don't see this.
            // If they selected Arm + Leg (weird combo), they DO see this because !Neck and !Back.
            // Logic in Q3 router handles entry.
            // This router just goes to radiating-pain.
            return 'radiating-pain';
        }
    },

    // Q4b: Pain Origin Clarification (New)
    {
        id: 'pain-origin',
        section: 'profile',
        theme: 'light',
        type: 'full-buttons',
        question: "Where does this pain seem to originate?",
        subtext: "Pain can sometimes be felt away from where it starts — this helps us understand patterns.", // Optional microcopy
        options: [], // Dynamic
        componentProps: {
            dynamicOptionsHeader: true // Logic handled in FullButtons
        },
        next: 'radiating-pain'
    },

    // Q5: Radiating Pain (conditional prompts based on primary region)
    {
        id: 'radiating-pain',
        section: 'profile',
        theme: 'light',
        type: 'yes-no',
        question: "", // Left empty to be handled by conditional logic in component
        subtext: "",
        componentProps: {
            conditionalQuestion: true,
            questions: {
                'Neck': "Does pain or tingling travel into your arm or hand?",
                'Arm / Shoulder': "Does pain or tingling travel into your arm or hand?",
                'default': "Does pain ever travel into your buttock, leg, or foot, or feel sharp, electric, or shooting?",
                'softened': "Do you ever notice this pain spreading, traveling, or changing location?"
            },
            VisualComponent: StickBack
        },
        options: [
            { value: true, label: 'Yes', icon: Zap },
            { value: false, label: 'No', icon: X }
        ],
        next: 'info-social-proof'
    },

    // INFO SLIDE A
    {
        id: 'info-social-proof',
        theme: 'dark',
        type: 'info-slide',
        question: "You're not the only one dealing with this.",
        subtext: "Many experience similar patterns — including flare-ups, movement sensitivity, or pain that travels.",
        componentProps: {
            VisualComponent: SocialProofIcon,
            headlineSubtext: "Back, neck, and nerve-related pain affect millions of people.",
            highlightedSubtext: "Next, we'll map your pain pattern to see if it looks like the cases that often respond best.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'avg-pain'
    },

    // ============================================
    // SECTION 2: SPINE
    // ============================================

    // Q6: Average Pain Level
    {
        id: 'avg-pain',
        section: 'spine',
        theme: 'light',
        type: 'pain-slider',
        question: "On an average day, how bad is your pain?",
        subtext: "0 = No pain, 10 = Worst imaginable",
        next: 'worst-pain'
    },

    // Q7: Worst Pain Level
    {
        id: 'worst-pain',
        section: 'spine',
        theme: 'light',
        type: 'pain-slider',
        question: "At its worst, how bad does it get?",
        subtext: "0 = No pain, 10 = Worst imaginable",
        next: 'movement-triggers'
    },

    // Q8: Movement Triggers
    {
        id: 'movement-triggers',
        section: 'spine',
        theme: 'light',
        type: 'tile-grid',
        question: "Which movements flare your pain the fastest?",
        subtext: "Pick up to 3",
        multiSelect: true,
        maxSelections: 3,
        options: [
            { value: 'Sitting', label: 'Sitting', icon: Armchair },
            { value: 'Standing', label: 'Standing', icon: PersonStanding },
            { value: 'Walking', label: 'Walking', icon: FaWalking },
            { value: 'Bending / lifting', label: 'Bending / lifting', icon: GiWeightLiftingUp },
            { value: 'Driving', label: 'Driving', icon: Car },
            { value: 'Coughing / sneezing', label: 'Coughing / sneezing', icon: FaHeadSideCough },
        ],
        next: 'duration'
    },

    // Q9: Duration
    {
        id: 'duration',
        section: 'spine',
        theme: 'light',
        type: 'split-image-options',
        question: "How long has this been going on?",
        autoAdvance: true,
        componentProps: {
            image: 'https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/23986ee2-ece3-4925-bed4-71e95a19a100/public',
            reverse: true
        },
        options: [
            { value: 'Less than 3 months', label: 'Less than 3 months' },
            { value: '3–12 months', label: '3–12 months' },
            { value: '1–3 years', label: '1–3 years' },
            { value: 'More than 3 years', label: 'More than 3 years' },
        ],
        next: 'prior-surgery'
    },

    // Q10: Prior Spine Surgery
    {
        id: 'prior-surgery',
        section: 'spine',
        theme: 'light',
        type: 'full-buttons',
        question: "Have you had spine surgery in the area that bothers you most?",
        autoAdvance: true,
        options: [
            { value: 'None', label: 'None' },
            { value: 'Microdiscectomy / laminectomy', label: 'Microdiscectomy / laminectomy' },
            { value: 'Disc replacement', label: 'Disc replacement' },
            { value: 'Fusion / rods / screws', label: 'Fusion / rods / screws' },
            { value: 'Other', label: 'Other' },
        ],
        next: (answers) => answers['prior-surgery'] === 'Fusion / rods / screws' ? 'medical-exit' : 'diagnosis'
    },

    // Q11: Doctor Diagnosis
    {
        id: 'diagnosis',
        section: 'spine',
        theme: 'light',
        type: 'tile-grid',
        question: "Have doctors used any of these terms for your condition?",
        multiSelect: true,
        options: [
            { value: 'Herniated disc', label: 'Herniated disc', icon: HerniatedDisc },
            { value: 'Bulging disc', label: 'Bulging disc', icon: BulgingDisc },
            { value: 'Degenerative disc disease', label: 'Degenerative disc disease', icon: DegenerativeDisc },
            { value: 'Sciatica', label: 'Sciatica', icon: Sciatica },
            { value: 'Spinal stenosis', label: 'Spinal stenosis', icon: SpinalStenosis },
            { value: 'Not sure / Other / None', label: 'Not sure / Other / None', icon: HelpCircle },
        ],
        next: 'treatments-tried'
    },

    // Q12: Treatments Tried
    {
        id: 'treatments-tried',
        section: 'spine',
        theme: 'light',
        type: 'tile-grid',
        question: "What have you already tried for this?",
        multiSelect: true,
        options: [
            { value: 'Physical therapy', label: 'Physical therapy', icon: HeartHandshake },
            { value: 'Chiropractic', label: 'Chiropractic', icon: ChiropracticIcon },
            { value: 'Injections', label: 'Injections', icon: Syringe },
            { value: 'Pain medication', label: 'Pain medication', icon: Pill },
            { value: 'Other conservative care', label: 'Other conservative care', icon: MoreHorizontal },
        ],
        next: (answers) => {
            const treatments = answers['treatments-tried'] || [];
            return treatments.length > 0 ? 'relief-level' : 'info-nerve';
        }
    },

    // Q13: Relief Level (conditional)
    {
        id: 'relief-level',
        section: 'spine',
        theme: 'light',
        type: 'full-buttons',
        question: "How well did those treatments work?",
        autoAdvance: true,
        options: [
            { value: 'A little relief', label: 'A little relief' },
            { value: 'Relief, but temporary', label: 'Relief, but temporary' },
            { value: 'Works only if I keep doing it', label: 'Works only if I keep doing it' },
            { value: 'No real relief', label: 'No real relief' },
        ],
        next: 'info-nerve'
    },



    // INFO SLIDE B
    {
        id: 'info-nerve',
        theme: 'dark',
        type: 'info-slide',
        question: "Surgery isn’t the first question good clinicians ask.",
        subtext: "When symptoms follow movement or nerve-related patterns, clinicians often start by asking how the spine is functioning — not how to remove or block symptoms.",
        componentProps: {
            VisualComponent: SurgeryIcon,
            highlightedSubtext: "Low-risk, reversible approaches are commonly evaluated before invasive options are considered.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'sleep-disruption'
    },

    // ============================================
    // SECTION 3: LIFESTYLE
    // ============================================

    // Q15: Sleep Disruption
    {
        id: 'sleep-disruption',
        section: 'lifestyle',
        theme: 'light',
        type: 'yes-no',
        question: "Does your pain ever wake you up or keep you from sleeping?",
        options: [
            { value: true, label: 'Yes', icon: Moon },
            { value: false, label: 'No', icon: X }
        ],
        componentProps: {
            VisualComponent: Sleep
        },
        next: 'mood-impact'
    },

    // Q16: Mood Impact
    {
        id: 'mood-impact',
        section: 'lifestyle',
        theme: 'light',
        type: 'tile-grid',
        question: "How has this pain been affecting your mood lately?",
        subtext: "Pick up to 2",
        multiSelect: true,
        maxSelections: 2,
        options: [
            { value: 'Frustrated / irritable', label: 'Frustrated / irritable', icon: Frown },
            { value: 'Anxious / worried', label: 'Anxious / worried', icon: AlertCircle },
            { value: 'Depressed / hopeless', label: 'Depressed / hopeless', icon: Frown },
            { value: 'Tired / drained', label: 'Tired / drained', icon: Clock },
            { value: "I'm handling it okay", label: "I'm handling it okay", icon: ThumbsUp },
        ],
        next: 'meds-current'
    },

    // Q17: Medication Use
    {
        id: 'meds-current',
        section: 'lifestyle',
        theme: 'light',
        type: 'yes-no',
        question: "Are you currently taking pain medication for this?",
        options: [
            { value: true, label: 'Yes', icon: Pill },
            { value: false, label: 'No', icon: X }
        ],
        componentProps: {
            image: 'https://imagedelivery.net/ye6TBwd9tSy8dGYL2VHjgg/da69f16e-dc1e-4c07-d7ea-16dd85ca9a00/public'
        },
        next: 'info-disc-rehab'
    },

    // INFO SLIDE C
    {
        id: 'info-disc-rehab',
        theme: 'dark',
        type: 'info-slide',
        question: "Spinal rehabilitation isn't about force. It's about response and adjustment.",
        subtext: "Spinal decompression uses computer-guided cycles tailored in real time to each patient — designed to reduce abnormal stress, restore motion, and improve how spinal tissues tolerate movement.",
        componentProps: {
            VisualComponent: SpinalRehabIcon,
            highlightedSubtext: "For many patients, changing the mechanical environment of the spine is what allows lasting improvement, not just temporary relief.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'activity-goal'
    },

    // ============================================
    // SECTION 4: PLAN
    // ============================================



    // Q19: Activity Goal
    {
        id: 'activity-goal',
        section: 'plan',
        theme: 'light',
        type: 'full-buttons',
        question: "What's the first thing you'd like to get back to?",
        autoAdvance: true,
        options: [
            { value: 'Working pain-free', label: 'Working pain-free' },
            { value: 'Playing with kids', label: 'Playing with kids' },
            { value: 'Sleeping through the night', label: 'Finally sleeping' },
            { value: 'Exercising', label: 'Exercising' },
            { value: 'Traveling', label: 'Traveling' },
            { value: 'other', label: 'Other', inputType: 'text' },
        ],
        componentProps: {
            conditionalInput: true,
            inputPlaceholder: "What would you like to do?",
            VisualComponent: ActivityGoalIcon,
            gridLayout: true
        },
        next: 'time-availability'
    },

    // Q20: Time Availability
    {
        id: 'time-availability',
        section: 'plan',
        theme: 'light',
        type: 'full-buttons',
        question: "If this could actually help long-term, could you free up 2–3 brief visits per week?",
        autoAdvance: true,
        options: [
            { value: 'Yes', label: 'Yes' },
            { value: 'Probably', label: 'Probably' },
            { value: 'Not sure', label: 'Not sure' },
            { value: 'No', label: 'No' },
        ],
        next: 'biggest-concern'
    },

    // Q21: Biggest Concern (with dynamic routing to info slides)
    {
        id: 'biggest-concern',
        section: 'plan',
        theme: 'light',
        type: 'full-buttons',
        question: "What's your biggest concern about spinal decompression therapy?",
        options: [
            { value: 'Cost', label: 'Cost' },
            { value: 'Safety', label: 'Safety' },
            { value: 'Effectiveness', label: 'Effectiveness' },
            { value: 'Time', label: 'Time' },
        ],
        next: (answers) => {
            const concern = answers['biggest-concern'];
            switch (concern) {
                case 'Cost': return 'info-cost';
                case 'Safety': return 'info-safety';
                case 'Effectiveness': return 'info-effectiveness';
                case 'Time': return 'info-time';
                default: return 'name-email-capture';
            }
        }
    },

    // Concern Info Slides
    {
        id: 'info-cost',
        theme: 'dark',
        type: 'info-slide',
        question: "Quality care is an investment in your future.",
        subtext: "Many patients find that spinal decompression is more affordable than they expected, especially when compared to the long-term costs of surgery or ongoing medication.",
        componentProps: {
            VisualComponent: DollarSign,
            highlightedSubtext: "We offer flexible payment options and work with you to make relief accessible.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'name-email-capture'
    },
    {
        id: 'info-safety',
        theme: 'dark',
        type: 'info-slide',
        question: "Safety and comfort are our top priorities.",
        subtext: "Spinal decompression is a non-surgical, non-invasive therapy. Our computer-guided systems are designed to be gentle and precisely targeted to your needs.",
        componentProps: {
            VisualComponent: Shield,
            highlightedSubtext: "Most patients find the treatments relaxing, with no recovery time needed afterward.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'name-email-capture'
    },
    {
        id: 'info-effectiveness',
        theme: 'dark',
        type: 'info-slide',
        question: "Designed for lasting results, not just relief.",
        subtext: "By addressing the underlying mechanical stress on your discs and nerves, decompression helps the body actually restore function rather than just masking symptoms.",
        componentProps: {
            VisualComponent: ThumbsUp,
            highlightedSubtext: "This approach is often successful even for patients who haven't found relief through other conservative care.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'name-email-capture'
    },
    {
        id: 'info-time',
        theme: 'dark',
        type: 'info-slide',
        question: "Relief that fits into your life.",
        subtext: "Each session is brief, and because there is no downtime or recovery period, you can stay active at work and with your family throughout your program.",
        componentProps: {
            VisualComponent: Clock,
            highlightedSubtext: "We offer convenient scheduling to ensure your treatment plan works with your busy routine.",
            highlightedSubtextBorder: "border-dashed border-4 border-white/50",
            highlightedSubtextBg: "bg-transparent shadow-none"
        },
        next: 'name-email-capture'
    },

    // ============================================
    // LEAD CAPTURE & RESULTS FLOW
    // ============================================

    // Name + Email Capture
    {
        id: 'name-email-capture',
        theme: 'light',
        type: 'form',
        componentProps: { formType: 'name-email' },
        next: 'mcclure-loading'
    },

    // McClure Loading Screen
    {
        id: 'mcclure-loading',
        theme: 'dark',
        type: 'loading',
        componentProps: { variant: 'mcclure' },
        next: 'pain-profile'
    },

    // Pain Profile
    {
        id: 'pain-profile',
        theme: 'dark',
        type: 'pain-profile',
        next: 'phone-capture'
    },

    // Phone + ZIP Capture (with loading)
    {
        id: 'phone-capture',
        theme: 'light',
        type: 'phone-capture',
        next: 'final-report'
    },

    // Final Report
    {
        id: 'final-report',
        theme: 'light',
        type: 'final-report',
        next: 'done'
    },

    // Medical Exit (for fusion patients)
    {
        id: 'medical-exit',
        theme: 'dark',
        type: 'medical-exit',
        next: 'done'
    }
];
