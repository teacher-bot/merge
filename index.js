const defaultsShape = {
  success: 'string',
  failure: 'string'
}

function checkForDefaults (defaults) {
  const errors = Object.keys(defaultsShape).filter(key => !Object.prototype.hasOwnProperty.call(defaults, key))
  if (errors.length > 0) errors.forEach(err => console.error(`Key \`${err}\` of type \`${defaultsShape[err]}\` is missing.`))
}

/**
 * @typedef {Object} Config
 * @prop {string} message
 *
 * Anytime a user merges a pull request, they are reminded to delete their branch.
 * @param {Object} robot
 * @param {Config} defaults
 * @param {String} [configFilename]
 */
module.exports = (robot, defaults = {success: "Congratulations! I'm merging this automagically.", failure: "Uh oh, something went wrong. I can't merge automatically."}, configFilename = 'merge.yml') => {
  checkForDefaults(defaults)

  const checkStatuses = async context => {
    let config
    try {
      const {merge} = await context.config(configFilename)
      config = Object.assign({}, defaults, merge)
    } catch (err) {
      config = defaults
    }

    robot.log('Checking for mergability')

    let pr = await context.github.pullRequests.get(context.issue())
    robot.log(`checking if it's mergeable`)

    while ((pr.data.mergeable === null)) {
      pr = await context.github.pullRequests.get(context.issue())
    }

    if (pr.data.mergeable) {
      robot.log('checks passed, merging automagically')

      try {
        await context.github.repos.merge(context.repo({
          base: 'master',
          head: context.payload.pull_request.head.ref
        }))

        return context.github.issues.createComment(context.repo({
          number: context.payload.number,
          body: config.success
        }))  
      } catch (err) {

      }

    }

    await context.github.issues.createComment(context.repo({
      number: context.payload.number,
      body: config.failure
    }))
    return false
  }

  robot.on('pull_request.opened', checkStatuses)
  robot.on('pull_request.edited', checkStatuses)
  robot.on('pull_request.reopened', checkStatuses)
  robot.on('pull_request.synchronize', checkStatuses)

  console.log('Yay, the teacher-bot/merge plugin was loaded!')

  // For more information on building plugins:
  // https://github.com/probot/probot/blob/master/docs/plugins.md

  // To get your plugin running against GitHub, see:
  // https://github.com/probot/probot/blob/master/docs/development.md
}
