// Use the 'createRequire' function to create a require function compatible with ES modules
// const { createRequire } = require('module');
// const require = createRequire(import.meta.url);


const Email = require('../../models/email.model.js');
const mongoose = require('mongoose');

// const Account = require('../models/Account.js');
const User = require('../../models/user.model.js');
const { validationResult } = require('express-validator');
// Use dynamic require to import an ESM module in a CommonJS module

// Get all emails for the authenticated user
module.exports.getAllEmails = async (request, response, next) => {
  try {
    // Find the user's mailbox including all folders: inbox, outbox, drafts, trash
    const { mailbox } = await User.findOne({ _id: request.user._id })
      .select('mailbox')
      .populate({
        path: 'mailbox',
        populate: { path: 'inbox outbox drafts trash' },
        options: { sort: { date: -1 } }  // Sort by date in descending order
      });

    // Log and respond with found emails
    console.log('Emails found:', mailbox);
    response.status(200).json({ message: 'Emails found', mailbox });
  } catch (error) {
    // Handle errors
    console.error('Error retrieving emails:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};
// Send an email
module.exports.sendEmail = async (request, response, next) => {
  try {
    const validationErrors = validationResult(request);
    if (!validationErrors.isEmpty()) {
      return response.status(400).json({
        message: 'Invalid data, see response.data.errors for more information',
        errors: validationErrors.errors,
      });
    }

    // Construct outgoing email
    const newEmailOut = new Email({
      from: request.user.email, // Use the authenticated user's email as 'from'
      to: request.body.to,
      subject: request.body.subject,
      message: request.body.message,
    });

    // Save outgoing email
    const savedEmailOut = await newEmailOut.save();
    console.log('Email sent', savedEmailOut);

    // Generate a random reply email
    const newEmailIn = new Email({
      from: request.body.to,
      to: request.user.email, // Use the authenticated user's email as 'to'
      subject: 'Re: ' + request.body.subject,
      message: request.body.message, // Consider providing an actual reply message
    });

    // Save random reply email
    const savedEmailIn = await newEmailIn.save();
    console.log('Reply received', savedEmailIn);

    // Update user's email IDs (outbox and inbox)
    const foundAccount = await User.findOne({ _id: request.user._id });
    foundAccount.mailbox.outbox.push(savedEmailOut._id);
    foundAccount.mailbox.inbox.push(savedEmailIn._id);
    await foundAccount.save();

    response.status(201).json({
      message: 'Email sent, reply received',
      sent: savedEmailOut,
      received: savedEmailIn,
      user: {
        fullname: request.user.fullname,
        username: request.user.username,
        from: request.user.email,
      },
    });
  } catch (error) {
    console.error(error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.saveDraft = async(request, response, next) => {
  try {
    // construct new draft
    let newDraft = new Email({
      from: request.body.from,
      to: request.body.to,
      subject: request.body.subject,
      message: request.body.message,
    });

    // save constructed draft
    const savedDraft = await newDraft.save();
    console.log('Draft saved', savedDraft);

    response.status(201).json({ message: 'Draft saved', draft: savedDraft });

    // this runs after response has been sent to client
    // find user and update it's email ID's
    const foundAccount = await User.findOne({ _id: request.user._id });
    foundAccount.mailbox.drafts.push(savedDraft._id);
    await foundAccount.save();
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}

module.exports.updateDraft = async(request, response, next) => {
  try {
    // find draft using id
    let foundDraft = await Email.findOne({ _id: request.params.id });
    if (!foundDraft)
      return response.status(404).json({ message: 'Email not found', id: request.params.id });

    // update it contents
    foundDraft.to = request.body.to;
    foundDraft.subject = request.body.subject;
    foundDraft.message = request.body.message;

    // and save the draft
    const savedDraft = await foundDraft.save();
    console.log('Draft updated', savedDraft);

    response.status(200).json({ message: 'Draft updated', draft: savedDraft });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
};

module.exports.moveToTrash = async(request, response, next) => {
  try {
    // find user by ID
    const foundUser = await User.findOne({ _id: request.user._id });

    // locate email in inbox/outbox/drafts and move it to trash
    let { inbox, outbox, drafts, trash } = foundUser.mailbox;
    let isEmailFound = false;

    if (!isEmailFound)
      // search inbox
      for (let i = 0; i < inbox.length; i++) {
        if (inbox[i].equals(request.params.id)) {
          trash.push(inbox[i]);
          inbox.splice(i, 1);
          console.log('Moved from inbox to trash', request.params.id);
          isEmailFound = true;
          break;
        }
      }

    if (!isEmailFound)
      // search outbox
      for (let i = 0; i < outbox.length; i++) {
        if (outbox[i].equals(request.params.id)) {
          trash.push(outbox[i]);
          outbox.splice(i, 1);
          console.log('Moved from outbox to trash', request.params.id);
          isEmailFound = true;
          break;
        }
      }

    if (!isEmailFound)
      // search drafts
      for (let i = 0; i < drafts.length; i++) {
        if (drafts[i].equals(request.params.id)) {
          trash.push(drafts[i]);
          drafts.splice(i, 1);
          console.log('Moved from drafts to trash', request.params.id);
          isEmailFound = true;
          break;
        }
      }

    // save changes, then populate mailbox for client
    const savedUser = await foundUser.save();
    const { mailbox } = await Account.populate(
      savedUser,
      'mailbox.inbox mailbox.outbox mailbox.drafts mailbox.trash',
    );

    response.status(200).json({ message: 'Moved to trash', mailbox });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}

module.exports.removeFromTrash = async(request, response, next) => {
  try {
    // find user by ID
    const foundUser = await User.findOne({ _id: request.user._id }).populate(
      'mailbox.inbox mailbox.outbox mailbox.drafts mailbox.trash',
    );

    // locate email in trash, and return to it's relative category
    const { inbox, outbox, drafts, trash } = foundUser.mailbox;
    for (let i = 0; i < trash.length; i++) {
      // if id's match, email was found in current loop
      if (trash[i]._id.equals(request.params.id)) {
        if (trash[i].to === '' || trash[i].subject === '' || trash[i].message === '') {
          // email origin is drafts
          drafts.push(trash[i]._id);
          trash.splice(i, 1);
          console.log('Moved from trash to drafts', request.params.id);
        } else if (trash[i].from === foundUser.email) {
          // email origin is outbox
          outbox.push(trash[i]._id);
          trash.splice(i, 1);
          console.log('Moved from trash to outbox', request.params.id);
        } else {
          // email origin is inbox
          inbox.push(trash[i]._id);
          trash.splice(i, 1);
          console.log('Moved from trash to inbox', request.params.id);
        }

        break;
      }
    }

    // save changes, then populate mailbox for client
    const savedUser = await foundUser.save();
    const { mailbox } = await Account.populate(
      savedUser,
      'mailbox.inbox mailbox.outbox mailbox.drafts mailbox.trash',
    );

    response.status(200).json({ message: 'Removed from trash', mailbox });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}

module.exports.toggleEmailProperty = async(request, response, next) => {
  try {
    // find email by id,
    const foundEmail = await Email.findOne({ _id: request.params.id });
    if (!foundEmail)
      return response.status(404).json({ message: 'Email not found', id: request.params.id });

    // and update its chosen property
    switch (request.params.toggle) {
      case 'read':
        foundEmail.read = true;
        break;
      case 'unread':
        foundEmail.read = false;
        break;
      case 'favorite':
        foundEmail.favorite = true;
        break;
      case 'unfavorite':
        foundEmail.favorite = false;
        break;
      default:
        return response.status(404).json({ message: "Wrong params, can't parse request" });
    }

    const savedEmail = await foundEmail.save();
    console.log(`${request.params.toggle} status updated`, savedEmail);

    // return email
    response
      .status(200)
      .json({ message: `${request.params.toggle} status updated`, email: savedEmail });
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}

module.exports.deleteEmail = async(request, response, next) => {
  try {
    // find email by id, and update it delete it
    await Email.deleteOne({ _id: request.params.id });
    console.log('Email deleted', request.params.id);

    // return email ID (so client can remove the email from a state)
    response.status(200).json({ message: 'Email deleted', id: request.params.id });

    // this runs after response has been sent to client
    // find user and update it's email ID's
    const foundAccount = await Account.findOne({ _id: request.user._id });
    let isEmailFound = false;
    let trashbox = foundAccount.mailbox.trash;
    for (let i = 0; i < trashbox.length; i++) {
      if (trashbox[i].equals(request.params.id)) {
        trashbox.splice(i, 1);
        isEmailFound = true;
        break;
      }
    }
    if (!isEmailFound) {
      let drafts = foundAccount.mailbox.drafts;
      for (let i = 0; i < drafts.length; i++) {
        if (drafts[i].equals(request.params.id)) {
          drafts.splice(i, 1);
          break;
        }
      }
    }
    await foundAccount.save();
  } catch (error) {
    console.log(error);
    response.status(500);
  }
}
module.exports.GetEmailById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: 'Invalid ID format' });
    }

    const email = await Email.findById(id);
    if (!email) {
      return res.status(404).send({ message: 'Email not found' });
    }
    console.log(id)
    res.status(200).send(email);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};