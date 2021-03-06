// Generated by CoffeeScript 1.8.0
(function() {
  var SlackAdmin, SlackWebhooksDirective, debounce, initSlackPlugin, module, slackInfo;

  this.taigaContribPlugins = this.taigaContribPlugins || [];

  slackInfo = {
    slug: "slack",
    name: "Slack",
    type: "admin",
    module: 'taigaContrib.slack'
  };

  this.taigaContribPlugins.push(slackInfo);

  module = angular.module('taigaContrib.slack', []);

  debounce = function(wait, func) {
    return _.debounce(func, wait, {
      leading: true,
      trailing: false
    });
  };

  initSlackPlugin = function($tgUrls) {
    return $tgUrls.update({
      "slack": "/slack"
    });
  };

  SlackAdmin = (function() {
    SlackAdmin.$inject = ["$rootScope", "$scope", "$tgRepo", "tgAppMetaService", "$tgConfirm", "$tgHttp"];

    function SlackAdmin(rootScope, scope, repo, appMetaService, confirm, http) {
      this.rootScope = rootScope;
      this.scope = scope;
      this.repo = repo;
      this.appMetaService = appMetaService;
      this.confirm = confirm;
      this.http = http;
      this.scope.sectionName = "Slack";
      this.scope.sectionSlug = "slack";
      this.scope.$on("project:loaded", (function(_this) {
        return function() {
          var promise;
          promise = _this.repo.queryMany("slack", {
            project: _this.scope.projectId
          });
          promise.then(function(slackhooks) {
            var description, title;
            _this.scope.slackhook = {
              project: _this.scope.projectId,
              notify_userstory_create: true,
              notify_userstory_change: true,
              notify_userstory_delete: true,
              notify_task_create: true,
              notify_task_change: true,
              notify_task_delete: true,
              notify_issue_create: true,
              notify_issue_change: true,
              notify_issue_delete: true,
              notify_wikipage_create: true,
              notify_wikipage_change: true,
              notify_wikipage_delete: true
            };
            if (slackhooks.length > 0) {
              _this.scope.slackhook = slackhooks[0];
            }
            title = "" + _this.scope.sectionName + " - Plugins - " + _this.scope.project.name;
            description = _this.scope.project.description;
            return _this.appMetaService.setAll(title, description);
          });
          return promise.then(null, function() {
            return _this.confirm.notify("error");
          });
        };
      })(this));
    }

    SlackAdmin.prototype.testHook = function() {
      var promise;
      promise = this.http.post(this.repo.resolveUrlForModel(this.scope.slackhook) + '/test');
      promise.success((function(_this) {
        return function(_data, _status) {
          return _this.confirm.notify("success");
        };
      })(this));
      return promise.error((function(_this) {
        return function(data, status) {
          return _this.confirm.notify("error");
        };
      })(this));
    };

    return SlackAdmin;

  })();

  module.controller("ContribSlackAdminController", SlackAdmin);

  SlackWebhooksDirective = function($repo, $confirm, $loading) {
    var link;
    link = function($scope, $el, $attrs) {
      var form, submit, submitButton;
      form = $el.find("form").checksley({
        "onlyOneErrorElement": true
      });
      submit = debounce(2000, (function(_this) {
        return function(event) {
          var currentLoading, promise;
          event.preventDefault();
          if (!form.validate()) {
            return;
          }
          currentLoading = $loading().target(submitButton).start();
          if (!$scope.slackhook.id) {
            promise = $repo.create("slack", $scope.slackhook);
            promise.then(function(data) {
              return $scope.slackhook = data;
            });
          } else if ($scope.slackhook.url) {
            promise = $repo.save($scope.slackhook);
            promise.then(function(data) {
              return $scope.slackhook = data;
            });
          } else {
            promise = $repo.remove($scope.slackhook);
            promise.then(function(data) {
              return $scope.slackhook = {
                project: $scope.projectId,
                notify_userstory_create: true,
                notify_userstory_change: true,
                notify_userstory_delete: true,
                notify_task_create: true,
                notify_task_change: true,
                notify_task_delete: true,
                notify_issue_create: true,
                notify_issue_change: true,
                notify_issue_delete: true,
                notify_wikipage_create: true,
                notify_wikipage_change: true,
                notify_wikipage_delete: true
              };
            });
          }
          promise.then(function(data) {
            currentLoading.finish();
            return $confirm.notify("success");
          });
          return promise.then(null, function(data) {
            currentLoading.finish();
            form.setErrors(data);
            if (data._error_message) {
              return $confirm.notify("error", data._error_message);
            }
          });
        };
      })(this));
      submitButton = $el.find(".submit-button");
      $el.on("submit", "form", submit);
      return $el.on("click", ".submit-button", submit);
    };
    return {
      link: link
    };
  };

  module.directive("contribSlackWebhooks", ["$tgRepo", "$tgConfirm", "$tgLoading", SlackWebhooksDirective]);

  module.run(["$tgUrls", initSlackPlugin]);

  module.run([
    '$templateCache', function($templateCache) {
      return $templateCache.put('contrib/slack', '<div contrib-slack-webhooks="contrib-slack-webhooks" ng-controller="ContribSlackAdminController as ctrl"><header><h1><span class="project-name">{{::project.name}}</span><span class="green">{{::sectionName}}</span></h1></header><form><label for="url">Slack webhook url</label><div class="contrib-form-wrapper"><fieldset class="contrib-input"><input type="text" name="url" ng-model="slackhook.url" placeholder="Slack webhook url" id="url" data-type="url"/></fieldset><fieldset ng-show="slackhook.id" class="contrib-test"><a href="" title="Test" ng-click="ctrl.testHook()" class="button-gray"><span>Test</span></a></fieldset></div><label for="channel">Slack webhook channel</label><div class="contrib-form-wrapper"><fieldset class="contrib-input"><input type="text" name="channel" ng-model="slackhook.channel" placeholder="#slackchannel" id="channel"/></fieldset></div><fieldset><h2>Notify User Stories</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_userstory_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_userstory_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_userstory_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Tasks</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_task_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_task_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_task_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Issues</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_issue_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_issue_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_issue_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><fieldset><h2>Notify Wiki</h2><div class="check-item"><span>Create</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_wikipage_create"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Change</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_wikipage_change"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div><div class="check-item"><span>Delete</span><div class="check"><input type="checkbox" name="notification" ng-model="slackhook.notify_wikipage_delete"/><div></div><span translate="COMMON.YES" class="check-text check-yes"></span><span translate="COMMON.NO" class="check-text check-no"></span></div></div></fieldset><button type="submit" class="hidden"></button><a href="" title="Save" ng-click="ctrl.updateOrCreateHook(slackhook)" class="button-green submit-button"><span>Save</span></a></form><a href="https://taiga.io/support/slack-integration/" target="_blank" class="help-button"><span class="icon icon-help"></span><span>Do you need help? Check out our support page!</span></a></div>');
    }
  ]);

}).call(this);
