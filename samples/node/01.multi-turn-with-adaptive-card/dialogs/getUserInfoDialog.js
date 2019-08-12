const { ActivityPrompt, ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog } = require('botbuilder-dialogs')
const { CardFactory, MessageFactory } = require('botbuilder')
const sampleInputCard = require('../sampleCard.json');

const USER_PROFILE = 'USER_PROFILE';
const CARD_PROMPT = 'CARD_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';

class GetUserInfoDialog extends ComponentDialog {
    constructor(userState) {
        super('getUserInfoDialog');

        this.userProfile = userState.createProperty(USER_PROFILE);

        this.addDialog(new ActivityPrompt(CARD_PROMPT, this.inputValidator));

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.showCardStep.bind(this),
            this.showUserInputStep.bind(this)
        ]));

        this.initialDialogId = WATERFALL_DIALOG;
    }

    async run(turnContext, accessor){
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async showCardStep(step){
        const inputForm = MessageFactory.attachment(CardFactory.adaptiveCard(sampleInputCard));
        return await step.prompt(CARD_PROMPT,{
            prompt: inputForm
        });
    }

    async showUserInputStep(step){
        const userInput = step.result.value;
        await step.context.sendActivity(`Hello ${userInput.myName}, your email address: ${userInput.myEmail} and phone number: ${userInput.myTel}`);
        return await step.endDialog();
    }
    
    // If you remove this validation logic, it will cause an error cause this is mandatory for ActivityPrompt
    async inputValidator(promptContext){
        const userInputObject = promptContext.recognized.value.value;

        // You can add some validation logic for email address and phone number
        // userInputObject.myEmail, userInputObject.myTel

        return true;
    }
}

module.exports.GetUserInfoDialog = GetUserInfoDialog;