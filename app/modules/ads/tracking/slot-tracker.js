import { track } from '../../../utils/track';

export const registerSlotTracker = () => {
  const {
    slotBiddersTrackingMiddleware,
    slotBillTheLizardStatusTrackingMiddleware,
    slotPropertiesTrackingMiddleware,
    slotTracker,
    slotTrackingMiddleware,
  } = window.Wikia.adEngine;

  slotTracker.onChangeStatusToTrack.push('catlapsed', 'hivi-collapse');
  slotTracker
    .add(slotTrackingMiddleware)
    .add(slotPropertiesTrackingMiddleware)
    .add(slotBiddersTrackingMiddleware)
    .add(slotBillTheLizardStatusTrackingMiddleware)
    .register(({ data }) => track({
      ...data,
      eventName: 'adengadinfo',
      trackingMethod: 'internal',
    }));
};

export const registerViewabilityTracker = () => {
  const {
    viewabilityPropertiesTrackingMiddleware,
    viewabilityTracker,
    viewabilityTrackingMiddleware,
  } = window.Wikia.adEngine;

  viewabilityTracker
    .add(viewabilityTrackingMiddleware)
    .add(viewabilityPropertiesTrackingMiddleware)
    .register(({ data }) => track({
      ...data,
      eventName: 'adengviewability',
      trackingMethod: 'internal',
    }));
};
