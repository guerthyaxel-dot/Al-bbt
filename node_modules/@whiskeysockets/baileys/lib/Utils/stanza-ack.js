/**
 * Builds an ACK stanza for a received node.
 * Pure function — no I/O, no side effects.
 *
 * Preserves the conditional type logic from baileys-main:
 * - type is only included for non-message tags, unavailable messages, or error ACKs
 * - from is only set for unavailable message ACKs
 *
 * Based on @blckrose/baileys v2.0.5, adapted to keep main's stricter WA behaviour.
 */
export function buildAckStanza(node, errorCode, meId, hasUnavailable = false) {
    const { tag, attrs } = node;
    const stanza = {
        tag: 'ack',
        attrs: {
            id: attrs.id,
            to: attrs.from,
            class: tag
        }
    };
    if (errorCode) {
        stanza.attrs.error = errorCode.toString();
    }
    if (attrs.participant) {
        stanza.attrs.participant = attrs.participant;
    }
    if (attrs.recipient) {
        stanza.attrs.recipient = attrs.recipient;
    }
    // Only include type when: not a message tag, OR it's an unavailable message, OR there's an error
    if (attrs.type && (tag !== 'message' || hasUnavailable || errorCode)) {
        stanza.attrs.type = attrs.type;
    }
    // Only set from for unavailable message ACKs
    if (tag === 'message' && hasUnavailable && meId) {
        stanza.attrs.from = meId;
    }
    return stanza;
}
