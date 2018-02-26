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
module.exports = (robot, defaults = {success: "Congratulations! I'm merging this automagically.", failure: "I can't merge automatically. It could be because (1) there's a merge conflict, or (2) I'm waiting for statuses to pass."}, configFilename = 'merge.yml') => {
  checkForDefaults(defaults)

  const checkStatuses = async context => {
    let config
    try {
      const {merge} = await context.config(configFilename)
      config = Object.assign({}, defaults, merge)
    } catch (err) {
      config = defaults
    }

    robot.log(`Checking for mergability of ${JSON.stringify(context.payload)}`)

    let pr = await context.github.pullRequests.get(context.issue())
    robot.log(`checking if it's mergeable`)

    while (pr.data.mergeable === null) {
      pr = await context.github.pullRequests.get(context.issue())
    }

    if (pr.data.mergeable) {
      robot.log('it\'s mergeable, trying to merge')

      try {
        let combinedStatus = await context.github.repos.getCombinedStatusForRef(context.repo({
          ref: 'master'
        }))

        while (combinedStatus.data.state === 'pending') {
          robot.log('refreshing status...')
          combinedStatus = await context.github.repos.getCombinedStatusForRef(context.repo({
            ref: 'master'
          }))
          robot.log(`got ${combinedStatus.data.state}`)
        }

        await context.github.pullRequests.merge(context.repo({
          number: context.payload.number
        }))

        robot.log('was able to merge')

        return context.github.issues.createComment(context.repo({
          number: context.payload.number,
          body: config.success
        }))
      } catch (err) {
        robot.log('wasnt able to merge')
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
