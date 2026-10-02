import { useAiGateway } from '../../utils/ai'

export default defineEventHandler(event => useAiGateway(event).describeChannels())
