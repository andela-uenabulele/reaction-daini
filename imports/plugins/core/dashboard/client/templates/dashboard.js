import { Reaction } from "/client/api";

//
// registry helper for the dashboard, assembles i18n labels
//
Template.dashboardHeader.helpers({
  registry() {
    // just some handle little helpers for default package i18nKey/i18nLabel
    const route = Reaction.Router.getRouteName();
    const registry = Reaction.getRegistryForCurrentRoute() || {};

    if (registry && route) {
      return Reaction.translateRegistry(registry);
    }
    // @TODO return appropriate default value here.
    return {};
  },

  labelIs(label) {
    const registry = Reaction.getRegistryForCurrentRoute() || {};
    return registry.label === label;
  }
});

//
// dashboard events
//
Template.dashboardHeader.events({
  "click [data-event-action=showPackageSettings]"() {
    Reaction.showActionView();
  }
});
