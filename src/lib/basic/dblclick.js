import { InteractionManager, InteractionTrackingData } from 'pixi.js';

const superAddEvents = InteractionManager.prototype.addEvents;
const superRemoveEvents = InteractionManager.prototype.removeEvents;

/**
 * To add DOM native 'dblclick' event to the manager
 * @private  
 * @extends
 */
InteractionManager.prototype.addEvents = function () {
    superAddEvents.call(this);

    this.onDoubleClick = this.onDoubleClick.bind(this);
    this.processDoubleClick = this.processDoubleClick.bind(this);

    if (this.interactionDOMElement) {
        this.interactionDOMElement.addEventListener('dblclick', this.onDoubleClick, true);
    }
};

/**
 * @private
 * @extends
 */
InteractionManager.prototype.removeEvents = function () {
    if (this.interactionDOMElement) {
        this.interactionDOMElement.removeEventListener('dblclick', this.onDoubleClick, true);
    }
    superRemoveEvents.call(this);
};

/**
 * Processes the result of the double click check and dispatches the event
 *
 * @private
 * @param {PIXI.interaction.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
 * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
 * @param {boolean} hit - the result of the hit test on the display object
 */
InteractionManager.prototype.processDoubleClick = function (interactionEvent, displayObject, hit) {
    var data = interactionEvent.data;
    var id = interactionEvent.data.identifier;

    if (hit) {
        if (!displayObject.trackedPointers[id]) {
            displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        if (data.pointerType === 'mouse') {
            this.dispatchEvent(displayObject, 'dblclick', interactionEvent);
        }
    }
};

/**
 * @param {PointerEvent} originalEvent
 */
InteractionManager.prototype.onDoubleClick = function (originalEvent) {
    // if we support touch events, then only use those for touch events, not pointer events
    if (this.supportsTouchEvents && originalEvent.pointerType === 'touch') {
        return;
    }

    const events = this.normalizeToPointerData(originalEvent);

    if (this.autoPreventDefault && events[0].isNormalized) {
        const cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);

        if (cancelable) {
            originalEvent.preventDefault();
        }
    }

    const eventLen = events.length;

    for (let i = 0; i < eventLen; i++) {
        const event = events[i];

        const interactionData = this.getInteractionDataForPointerId(event);

        const interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);

        interactionEvent.data.originalEvent = originalEvent;

        this.processInteractive(interactionEvent, this.renderer._lastObjectRendered, this.processDoubleClick, true);

        this.emit('dblclick', interactionEvent);
    }
};