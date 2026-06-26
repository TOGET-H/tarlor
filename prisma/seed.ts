import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const cards = [
  {
    name: 'The Fool',
    arcana: 'major',
    suit: null,
    number: '0',
    uprightMeaning: 'New beginnings, openness, trust, and a willingness to step into the unknown.',
    reversedMeaning: 'Carelessness, hesitation, scattered energy, or ignoring practical risks.',
    description: 'The Fool marks the first step of a journey and the courage to begin without full certainty.'
  },
  {
    name: 'The Magician',
    arcana: 'major',
    suit: null,
    number: 'I',
    uprightMeaning: 'Focus, skill, willpower, and turning available resources into action.',
    reversedMeaning: 'Manipulation, unused talent, unclear intention, or lack of follow-through.',
    description: 'The Magician connects idea and execution through concentration and craft.'
  },
  {
    name: 'The High Priestess',
    arcana: 'major',
    suit: null,
    number: 'II',
    uprightMeaning: 'Intuition, inner knowing, hidden information, and quiet observation.',
    reversedMeaning: 'Blocked intuition, secrecy, confusion, or refusing to listen inwardly.',
    description: 'The High Priestess asks for patience and attention to what is not obvious.'
  },
  {
    name: 'The Empress',
    arcana: 'major',
    suit: null,
    number: 'III',
    uprightMeaning: 'Nurturing, abundance, creativity, comfort, and natural growth.',
    reversedMeaning: 'Overgiving, creative block, dependence, or neglecting personal needs.',
    description: 'The Empress brings the energy of care, beauty, and sustained creation.'
  },
  {
    name: 'The Emperor',
    arcana: 'major',
    suit: null,
    number: 'IV',
    uprightMeaning: 'Structure, authority, discipline, protection, and practical leadership.',
    reversedMeaning: 'Rigidity, control issues, weak boundaries, or unstable foundations.',
    description: 'The Emperor favors order, responsibility, and decisions with clear boundaries.'
  },
  {
    name: 'The Lovers',
    arcana: 'major',
    suit: null,
    number: 'VI',
    uprightMeaning: 'Choice, alignment, partnership, values, and honest connection.',
    reversedMeaning: 'Misalignment, avoidance, difficult choices, or divided priorities.',
    description: 'The Lovers highlights decisions that reveal what someone truly values.'
  },
  {
    name: 'Strength',
    arcana: 'major',
    suit: null,
    number: 'VIII',
    uprightMeaning: 'Inner courage, patience, emotional steadiness, and gentle persistence.',
    reversedMeaning: 'Self-doubt, impatience, emotional reactivity, or forcing an outcome.',
    description: 'Strength shows power expressed through calm discipline rather than force.'
  },
  {
    name: 'The Hermit',
    arcana: 'major',
    suit: null,
    number: 'IX',
    uprightMeaning: 'Reflection, solitude, wisdom, guidance, and searching for truth.',
    reversedMeaning: 'Isolation, withdrawal, overthinking, or rejecting useful guidance.',
    description: 'The Hermit turns attention inward to find a more durable answer.'
  },
  {
    name: 'Ace of Cups',
    arcana: 'minor',
    suit: 'cups',
    number: 'Ace',
    uprightMeaning: 'Emotional renewal, compassion, love, intuition, and an open heart.',
    reversedMeaning: 'Emotional blockage, guardedness, disappointment, or unspoken feelings.',
    description: 'The Ace of Cups begins a cycle of emotional openness and connection.'
  },
  {
    name: 'Three of Swords',
    arcana: 'minor',
    suit: 'swords',
    number: 'Three',
    uprightMeaning: 'Heartbreak, truth, grief, painful clarity, and necessary release.',
    reversedMeaning: 'Healing, forgiveness, delayed grief, or difficulty moving on.',
    description: 'The Three of Swords names pain honestly so recovery can begin.'
  },
  {
    name: 'Six of Pentacles',
    arcana: 'minor',
    suit: 'pentacles',
    number: 'Six',
    uprightMeaning: 'Generosity, exchange, support, fairness, and practical help.',
    reversedMeaning: 'Imbalance, strings attached, debt, dependency, or unfair exchange.',
    description: 'The Six of Pentacles asks whether giving and receiving are balanced.'
  },
  {
    name: 'Page of Wands',
    arcana: 'minor',
    suit: 'wands',
    number: 'Page',
    uprightMeaning: 'Curiosity, enthusiasm, exploration, and early creative momentum.',
    reversedMeaning: 'Restlessness, scattered ideas, delay, or fear of beginning.',
    description: 'The Page of Wands brings fresh creative fire before the plan is mature.'
  }
]

async function main() {
  for (const card of cards) {
    await prisma.tarotCard.upsert({
      where: { name: card.name },
      update: card,
      create: card
    })
  }
}

main().finally(async () => {
  await prisma.$disconnect()
})
