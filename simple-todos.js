Tasks = new Mongo.Collection('tasks');
if (Meteor.isServer){
  // This code only runs on the server
  Meteor.publish("tasks", function () {
    return Tasks.find();
  });
}
if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("tasks");
  Template.body.helpers({
    tasks: function () {
      // Show newest tasks at the top
      if(Session.get("hideCompleted")){
        // if hide completed is checked, filter tasks
      return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
    } else {
      return Tasks.find({}, {sort: {createdAt: -1}});
    }

    }
  });
  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      Meteor.call("addTask", text);
      // Insert a task into the collection
      Tasks.insert({
        text: text,
        createdAt: new Date(), // current time
        owner: Meteor.userId(),
        username: Meteor.user().username
      });

      // Clear form
      event.target.text.value = "";
    },
    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    }
  });
  Template.task.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteTask", this._id);
    }
  });
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addTask: function (text) {
    //make sure the user is logged in
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
     Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});
