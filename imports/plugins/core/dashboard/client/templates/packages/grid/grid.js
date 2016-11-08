import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Reaction, i18next } from "/client/api";

function pkgPermissions(pkg) {
  // if (Reaction.hasPermission("dashboard")) {
  //   // route specific permissions
  //   if (pkg.name) {
  //     return Reaction.hasPermission(pkg.name);
  //   }
  //   // name is a global group role for packages
  //   if (pkg.template) {
  //     return Reaction.hasPermission(pkg.template);
  //   }
  // }
  return Reaction.hasPermission(pkg.name);
}

function enableReactionPackage(reactionPackage) {
  const self = reactionPackage;

  Meteor.call("shop/togglePackage", self.packageId, false,
    (error, result) => {
      if (result === 1) {
        Alerts.toast(
          i18next.t(
            "gridPackage.pkgEnabled",
            { app: i18next.t(self.i18nKeyLabel) }
          ),
          "error", {
            type: "pkg-enabled-" + self.name
          }
        );
        if (self.name || self.route) {
          const route = self.name || self.route;
          return Reaction.Router.go(route);
        }
      } else if (error) {
        return Alerts.toast(
          i18next.t(
            "gridPackage.pkgDisabled",
            { app: i18next.t(self.i18nKeyLabel) }
          ),
          "warning"
        );
      }
    }
  );
}

function disableReactionPackage(reactionPackage) {
  const self = reactionPackage;

  if (self.name === "core") {
    return;
  }

  Alerts.alert(
    "Disable Package",
    i18next.t("gridPackage.disableConfirm", { app: i18next.t(self.i18nKeyLabel) }),
    {
      type: "warning",
      showCancelButton: true
    },
    () => {
      Meteor.call("shop/togglePackage", self.packageId, true,
        (error, result) => {
          if (result === 1) {
            return Alerts.toast(
              i18next.t("gridPackage.pkgDisabled", {
                app: i18next.t(self.i18nKeyLabel)
              }),
              "success"
            );
          } else if (error) {
            throw new Meteor.Error("error disabling package", error);
          }
        }
      );
    });
}

Template.packagesGrid.onCreated(function () {
  this.state = new ReactiveDict();
  this.state.setDefault({
    groups: [],
    appsByGroup: {},
    apps: []
  });

  this.autorun(() => {
    const apps = Reaction.Apps({provides: "dashboard"});
    const groupedApps = _.groupBy(apps, (app) => {
      return app.container || "misc";
    });
    this.state.set("apps", apps);
    this.state.set("appsByGroup", groupedApps);
    this.state.set("groups", Object.keys(groupedApps));
  });
});

/**
 * packagesGrid helpers
 */
Template.packagesGrid.helpers({
  groups() {

    const group = Template.instance().state.get("groups");

    console.log(group);
    // const items = [];

    // const introMessages = [
    //   'this is your core settings',
    //   'this is your utility settings',
    //   'this is your appearance settings',
    //   'this is your connect settings',
    //   'this is your payment method settings',
    //   ]

    // for(let i = 0; i < group.length; i++) {
    //   console.log(group[i]);
    // }

    // if (_.isArray(group)) {
    //   for (let i = 0; i < group.length; i++) {
    //     items.push({
    //       "data-step": i+1,
    //       "data-intro": introMessages[i],
    //     });
    //   }
    // }
    return group;
  },

  messages(){
    const introMessages = [
      'This is your core settings',
      'Below is your utilities settings',
      'Followed next when you scroll is your appearance settings',
      'Scroll next is your connect settings',
      'And finally your payment method settings',
      ];

      return introMessages;
  },

  appsInGroup(groupName) {
    const group = Template.instance().state.get("appsByGroup") || {};
    // console.log(group);
    return group[groupName] || false;
  },

  shopId() {
    return Reaction.getShopId();
  },


  pkgPermissions
});

Template.packagesGridGroup.helpers({
  pkgPermissions,

  packageProps(app) {
    // console.log(app.template);
    return {
      package: app,
      enablePackage(reactionPackage, value) {
        if (value === true) {
          enableReactionPackage(reactionPackage);
        } else {
          disableReactionPackage(reactionPackage);
        }
      }
    };
  }
});

Template.registerHelper('groupIndex', function(i){
  return i + 14;
});

Template.registerHelper('introMsg', function(msg, i){
  console.log(msg, i);
  return msg[i];
});