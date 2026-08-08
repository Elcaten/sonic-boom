const { withXcodeProject } = require('@expo/config-plugins');

module.exports = function withIosAutomaticSigning(config) {
  return withXcodeProject(config, (modConfig) => {
    const project = modConfig.modResults;
    const { uuid: targetId, firstTarget: target } = project.getFirstTarget();
    const configurationList = project.pbxXCConfigurationList()[target.buildConfigurationList];
    const buildConfigurations = project.pbxXCBuildConfigurationSection();

    for (const configuration of configurationList.buildConfigurations) {
      buildConfigurations[configuration.value].buildSettings.CODE_SIGN_STYLE = 'Automatic';
    }

    project.addTargetAttribute('ProvisioningStyle', 'Automatic', targetId);

    return modConfig;
  });
};
