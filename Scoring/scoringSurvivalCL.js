
var localization = {
    en: {
        title: "Predicted probabilities for survival models",
        label100: "This dialog is designed to predict the probability of an event occuring at one or more \nspecified follow-up times. \nThe following requirements must be met.\n1. You must have built a cox regression model on a dataset where 1=event, 0=censor. \n2. The dataset that you want to generate predictions for must have all the independent variables used to create \nthe original model (except the follow-up time as you will specify this below). \n3. The timescale used for the follow-up time must match the timescale used to create the original model. \n4. If you want predictions for a single observation, you need to create a new dataset with that observation.",
        navigation: "Cox scoring",
        filterModels: "Filter models by class",
        modelSelection: "Select a model to score a dataset",
        label1: "Diagnostic tests",
        followUpTime: "Specify one or more follow-up times e.g. 1200, 1250, a predicted probabilities will be generated for each follow-up time",
        levelOfInterest: "When the variable to predict has 2 levels, specify the level of interest. The confusion matrix and related statistics are displayed with the specified level of interest as the reference",
        label12: "Test results: As soon as a model is selected, we will run tests to see whether dependent variables specified in the model are \navailable in the dataset to be scored. The results will be displayed here",
        label2: "Save survival probabilities.",
        label3: "Predicted probabilities are stored as new variables with prefix below prepended to the original event variable name",
        label4: "**For dependent variables with 2 levels, the 2nd level is treated as the positive level. See Data > Factor Levels > Reorder Levels Manually to change the order of factor levels and rebuild the model.",
        conflevel: "Save confidence intervals for individual predicted values  **(Valid only for linear models (class lm))",
        roctable: "Show ROC table (**For binary dependent variables only)",
        colname: "Specify column name prefix",
        label5: "**Checking the checkbox above will incur a performance penalty for large datasets.",
        level: "Specify the confidence level",
        confusioncheck: "Generate Confusion Matrix",
        help: {
            title: "Score A Dataset Using A Model",
            r_help: "help(predict, package='stats')",
            body: `
    WHEN MULTIPLE TIME PERIODS ARE SPECIFIED, A CONFUSION MATRIX AND ROC CURVE ARE GENERATED FOR THE FIRST TIME PERIOD ONLY
    <b>Description</b></br>
    Model scoring does the following</br>
    1. Scores the current dataset using the selected prebuilt model. Stores predictions with the specified confidence interval in the current dataset using the specified prefix.</br>
    2. Optionally creates a confusion matrix and a ROC curve</br>
    3. In the case where you are scoring a training dataset that contains the dependent variable/variable to predict and and the dependent variable has 2 levels, you have the option to select the reference level/level of interest.<br/>
    4. The confusion matrix and related statistics are created using the specified level of interest.<br/>
    See details on the predict function and confusion matrix below
    <br/>
    <br/>
    <b>Description</b></br>
    predict is a generic function for making predictions using the selected model. 
    <br/>
    <b>Usage</b>
    <br/>
    <code> 
    BSkyPredict(modelname, prefix, datasetname)
    </code> <br/>
    <b>Arguments</b><br/>
    <ul>
    <li>
    modelname:a model object for which prediction is desired.
    </li>
    <li>
    prefix:prefix string that will be used to create new variables containing the predictions.
    </li>
    <li>
    datasetname: is the current dataset to score and save predictions to.
    </li>
    </ul>
    <b>Details</b></br>
    Stores predictions with the specified confidence interval in the current dataset using the specified prefix.</br>
    <b>Package</b></br>
    stats</br>
    <b>Help</b></br>
    For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command help(predict, package ='stats') in the R editor window
    </br>
    </br>
    <b>Description</b></br>
    Creates a confusion matrix by cross-tabulating the observed and predicted classes with associated statistics. 
    <br/>
    <b>Usage</b>
    <br/>
    <code> 
    BSkyConfusionMartix(modelname,showCofusionMatrix,predictions,datasetname)
    </code> <br/>
    <b>Arguments</b><br/>
    <ul>
    <li>
    modelname : a model object for which confusion matrix is desired.
    </li>
    <li>
    showCofusionMatrix:  logical, if TRUE the confusion matrix is generated (if it applies), if FALSE, confusion matrix is not generated.
    </li>
    <li>
    predictions : an object that is returned as a result of predict() call.
    </li>
    <li>
    datasetname: is the current datasetname using which we want to make predictions.
    </li>
    </ul>
    <b>Details</b></br>
    Displays the confusion matrix using the function confusionMatrix in the package caret</br>
    <b>Package</b></br>
    caret</br>
    <b>Help</b></br>
    For detailed help click on the R icon on the top right hand side of this dialog overlay or run the following command help(confusionMatrix, package ='caret') in the R editor window
                `}
    }
}

class scoringSurvivalCL extends baseModal {
    constructor() {
        var config = {
            id: "scoringSurvivalCL",
            label: localization.en.title,
            modalType: "one",
            RCode: `
local(
{
#Run predict
BSkyPredictions <- BSkyPredict(modelname='{{selected.modelSelection | safe}}', prefix='{{selected.colname | safe}}', datasetname='{{dataset.name}}', BSkySurvival = TRUE, BSkySurvivalType =\"CL\", BSkyTime = c({{selected.followUpTime | safe}}))
}
)
#Refresh dataset
BSkyLoadRefresh("{{dataset.name}}")
`,
            pre_start_r: JSON.stringify({
                modelSelection: "BSkyGetAvailableModelsCP(objclasslist ='coxph')",
            })
        }
        var objects = {
            /* filterModels: {
                el: new selectVar(config, {
                    no: 'filterModels',
                    label: localization.en.filterModels,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["coxph"],
                    default: "coxph",
                    onselect_r: { modelSelection: "BSkyGetAvailableModelsCP( objclasslist = c('{{value}}'))" }
                })
            }, */
            label100: {
				el: new preVar(config, {
					no: "label100",
					label: localization.en.label100, 
					h:6
				})
			},
            modelSelection: {
                el: new selectVar(config, {
                    no: 'modelSelection',
                    label: localization.en.modelSelection,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: "",
                    required: true,
                    onselect_r: { label12: "predictPrerequisiteCP('{{value}}', '{{dataset.name}}',BSkySurvival = TRUE, BSkySurvivalType =\"CL\")"  }
                })
            },
            label12: { el: new preVar(config, { no: "label12", label: localization.en.label12, h: 6 }) },
            label1: { el: new labelVar(config, { label: localization.en.label1, no: "label1", h: 8, style: "mt-3" }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 8, style: "mt-3" }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
            followUpTime: {
                el: new input(config, {
                    no: 'followUpTime',
                    label: localization.en.followUpTime,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    required: true,
                    value: ""
                })
            },
            colname: {
                el: new input(config, {
                    no: 'colname',
                    label: localization.en.colname,
                    placeholder: "",
                    extraction: "TextAsIs",
                    type: "character",
                    required: true,
                    value: ""
                })
            },
           
            conflevel: {
                el: new checkbox(config, {
                    label: localization.en.conflevel,
                    no: "conflevel",
                    bs_type: "valuebox",
                    style: "mt-3",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            level: {
                el: new advancedSlider(config, {
                    no: "level",
                    label: localization.en.level,
                    min: 0,
                    max: 1,
                    style: "ml-3",
                    step: 0.05,
                    value: 0.95,
                    extraction: "NoPrefix|UseComma"
                })
            },
            confusioncheck: {
                el: new checkbox(config, {
                    label: localization.en.confusioncheck,
                    no: "confusioncheck",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            label4: { el: new labelVar(config, { label: localization.en.label4, h: 8, style: "ml-2" }) },
            levelOfInterest: {
                el: new comboBox(config, {
                    no: 'levelOfInterest',
                    label: localization.en.levelOfInterest,
                    multiple: false,
                    style: "mt-1  ml-4 mb-3",
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            }, 
            roctable: {
                el: new checkbox(config, {
                    label: localization.en.roctable,
                    no: "roctable",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    newline: true,
                    false_value: "FALSE",
                })
            },

            label5: { el: new labelVar(config, { label: localization.en.label5, h: 8, style: "mt-1,ml-2" }) },
        }
        const content = {
          // items: [ objects.label100.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.followUpTime.el.content, objects.colname.el.content, objects.confusioncheck.el.content, objects.roctable.el.content, objects.label5.el.content ],
          items: [ objects.label100.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content,  objects.followUpTime.el.content, objects.label2.el.content, objects.label3.el.content,  objects.colname.el.content  ],
            nav: {
                name: localization.en.navigation,
                icon: "icon-y-hat",
                onclick: `r_before_modal("${config.id}")`,
                modal_id: config.id
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
    prepareExecution(instance) {
        var res = [];
        var code_vars = {
            dataset: {
                name: getActiveDataset()
            },
            selected: {
                modelSelection: instance.objects.modelSelection.el.getVal(),
                label12: instance.objects.label12.el.getVal(),
                colname: instance.objects.colname.el.getVal(),
                conflevel: instance.objects.conflevel.el.getVal(),
                level: instance.objects.level.el.getVal(),
                followUpTime: instance.objects.followUpTime.el.getVal(),
               // confusioncheck: instance.objects.confusioncheck.el.getVal(),
               // roctable: instance.objects.roctable.el.getVal(),
               // levelOfInterest: instance.objects.levelOfInterest.el.getVal()
            }
        }
        if (code_vars.selected.label12.substr(0, 7) != "SUCCESS") {
            let cmd = "cat(\"ERROR: The predictor variables that the model requires for scoring are not available in the dataset.\n Please review the diagnostic message on the dialog.\")";
            res.push({ cmd: cmd, cgid: newCommandGroup() })
        }
        else {
            let cmd = instance.dialog.renderR(code_vars)
            cmd = removenewline(cmd);
            res.push({ cmd: cmd, cgid: newCommandGroup() })
        }
        return res;
    }
}
module.exports.item = new scoringSurvivalCL().render()