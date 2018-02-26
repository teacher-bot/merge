# Merge

This [Probot](https://github.com/probot/probot/) [plugin](https://github.com/probot/probot/#plugins) automatically merges pull requests with a successful status. It can be used by itself, or as part of a collection of plugins called [Teacherbot](https://github.com/teacher-bot/teacherbot/).

### Get Started

1. Install this app
1. You're done! But you can also customize the responses.

### Configuring Customized Responses

You can use the [default responses](https://github.com/teacher-bot/teacherbot/blob/master/index.js), but if you'd like to specify your own:

- If you're using this plugin as part of [Teacherbot](https://github.com/teacher-bot/teacherbot/): create a file inside a `.github` folder, named `teacherbot.yml` and include the text below.
- If you're using this plugin standalone: create a file inside a `.github` folder, named `remind-merge.yml` and include the text below.

```yml
remindMerge:
  merged: ":wave: hiya Please remember to delete your branch after merging or closing if you haven't done so already.",
  unmerged: "It looks like you closed this Pull Request without merging. If you need any help, just ask!"
```

### Running your own instance of this app

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.

### Getting Help and Contributing

Just open a new issue in this repo if you find a bug, have a suggestion, or would like to chat about contributing. We also welcome pull requests.

# Made with :heart: by :octocat:s and friends

This Probot plugin is made by the friendly :octocat:s from [GitHub Professional Services](https://services.github.com) with help from the open source community. This plugin is used during the training engagements that we provide.
