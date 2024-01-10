
var localization = {
    en: {
        title: "Score A Dataset Using A Model",
        navigation: "Model Scoring",
        filterModels: "Filter models by class",
        modelSelection: "Select a model to score a dataset",
        label1: "Diagnostic tests",
        levelOfInterest: "When the variable to predict has 2 levels, specify the level of interest. The confusion matrix and related statistics are displayed with the specified level of interest as the reference",
        label12: "Test results: As soon as a model is selected, we will run tests to see whether dependent variables specified in the model are \navailable in the dataset to be scored. The results will be displayed here",
        label2: "Save predicted values and supporting statistics.",
        label3: "Predictions and predicted probabilities where applicable are stored in the dataset being scored as new variables with prefix below",
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

class Scoring extends baseModal {
    constructor() {
        var config = {
            id: "Scoring",
            label: localization.en.title,
            modalType: "one",
            RCode: `
local(
{
#Run predict
BSkyPredictions <- BSkyPredict(modelname='{{selected.modelSelection | safe}}', prefix='{{selected.colname | safe}}', confinterval ={{selected.conflevel | safe}}, level ={{selected.level | safe}}, datasetname='{{dataset.name}}')
# if the 'confusion matrix checkbox' is checked attempt to show the confusion matrix
showConfusionMatrix={{selected.confusioncheck | safe}}\n
if (showConfusionMatrix)
{
if (is.null(BSkyPredictions[[3]]) && str_detect(getModelDependentVariable("{{selected.modelSelection | safe}}"), ",") )
{
msg = paste("A confusion matrix and a ROC table cannot be created as you have more than 2 dependent/reference variables namely: ",getModelDependentVariable("{{selected.modelSelection | safe}}"))
        print(msg)
    return(msg)
}
if (is.null(BSkyPredictions[[3]]))
{
msg = paste("A confusion matrix and a ROC table cannot be created as the dependent/reference variable: " , getModelDependentVariable("{{selected.modelSelection | safe}}"), " cannot be found in the dataset being scored", 
            collapse = "", sep = "")
        print(msg)
    return(msg)
}
#Generates the confusion matrix for train classes created by model tuning
if (getModelClass("{{selected.modelSelection | safe}}")  == 'train')
{
results <- BSkyConfusionMatrixTrain(predictions=BSkyPredictions[[1]],reference =BSkyPredictions[[3]], levelOfInterest = "{{selected.levelOfInterest | safe}}")
}
else
{
#Creates the confusion matrix for models created by the specific modeling algorithm
results <- BSkyConfusionMatrix(modelname='{{selected.modelSelection | safe}}', showConfusionMatrix={{selected.confusioncheck | safe}}, predictions=BSkyPredictions[[1]] ,levelOfInterest = "{{selected.levelOfInterest | safe}}", datasetname='{{dataset.name}}')
}
}
ROC=BSkyPredictions[[4]]
if ({{selected.roctable | safe}} && !ROC)
{
cat("\\nWe cannot show a ROC curve. \nThis may be due to the model type not supporting predicted probabilities or the dependent variable not having 2 levels")
}
if (ROC && {{selected.roctable | safe}})
{
#Added the numeric condition 08/15/2020 to address ROC table not working with Model Fitting -> Extreme Boosting
    if( class(BSkyPredictions[[3]] )  == 'logical'  || class(BSkyPredictions[[3]] )  == 'numeric')
    {
        BSkyPredictions[[3]] = as.factor( BSkyPredictions[[3]] )
    }
    if( getModelClass("{{selected.modelSelection | safe}}")  == 'glm' )
    {
    if (eval( parse(text=paste ("family(" ,"{{selected.modelSelection | safe}}", ")$family", sep='', collapse='') )) =="binomial" )
    {
    BSkyPredictions[[3]] = as.factor( BSkyPredictions[[3]] )
    }
    }
    results <-createROCTable(predictedprobs =BSkyPredictions[[2]],dependentvariable =BSkyPredictions[[3]], modelname="{{selected.modelSelection | safe}}",datasetname ="{{dataset.name}}")
    BSkyFormat(results, singleTableOutputHeader='ROC Table')
    BSkytemp = data.frame(BSkyPredictions[[2]], BSkyPredictions[[3]])
    BSkytemp = na.omit(BSkytemp)
    pr <- ROCR::prediction(BSkytemp[,1], BSkytemp[,2], label.ordering = levels(BSkyPredictions[[3]]))
    attributes(pr)$cutoffs[[1]][attributes(pr)$cutoffs[[1]]==Inf]<-1
    prf <- ROCR::performance(pr, measure = "tpr", x.measure = "fpr")
    attributes(prf)$cutoffs[[1]][attributes(prf)$cutoffs[[1]]==Inf]<-1   
    plot(prf, main = "ROC Curve")
    auc <- ROCR::performance(pr, measure = "auc")
    auc <- auc@y.values[[1]]
    cat( paste("The area under the curve (AUC) is",auc,sep=" "))
    perf <- ROCR::performance(pr, "sens", "spec")
    plot(perf, colorize=TRUE, lwd= 3, main="... Sensitivity/Specificity plots ...")
    if( exists("BSkytemp")) rm(BSkytemp)
}
}
)
#Refresh dataset
BSkyLoadRefresh("{{dataset.name}}")
`,
            pre_start_r: JSON.stringify({
                modelSelection: "BSkyGetAvailableModels(objclasslist ='All_Models', suppress = \"coxph\")",
            })
        }
        var objects = {
            filterModels: {
                el: new selectVar(config, {
                    no: 'filterModels',
                    label: localization.en.filterModels,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["adaboost", "All_Models", "BinaryTree", "blasso", "C5.0", "drc", "earth", "gbm", "glm", "glmnet", "knn3", "ksvm", "lm", "lmerModLmerTest", "lognet", "mlp", "multinom", "NaiveBayes", "nls", "nn", "nnet", "polr", "randomForest", "RandomForest", "ranger", "real_adaboost", "rlm", "rpart", "rq", "rsnns", "train", "xgb.Booster"],
                    default: "All_Models",
                    onselect_r: { modelSelection: "BSkyGetAvailableModels( objclasslist = c('{{value}}'))" }
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
                    onselect_r: { label12: "predictPrerequisiteCP('{{value}}', '{{dataset.name}}')" , levelOfInterest: "bivariateLevels(datasetName=c('{{dataset.name}}'),dependentVariable=getModelDependentVariable('{{value}}'))" }
                })
            },
            label12: { el: new preVar(config, { no: "label12", label: localization.en.label12, h: 6 }) },
            label1: { el: new labelVar(config, { label: localization.en.label1, no: "label1", h: 8, style: "mt-3" }) },
            label2: { el: new labelVar(config, { label: localization.en.label2, h: 8, style: "mt-3" }) },
            label3: { el: new labelVar(config, { label: localization.en.label3, h: 6 }) },
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
                    false_value: "FALSE",
                })
            },
            label5: { el: new labelVar(config, { label: localization.en.label5, h: 8, style: "mt-1,ml-2" }) },
        }
        const content = {
            items: [objects.filterModels.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.colname.el.content, objects.conflevel.el.content, objects.level.el.content, objects.confusioncheck.el.content, objects.label4.el.content, objects.levelOfInterest.el.content,objects.roctable.el.content, objects.label5.el.content],
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
                confusioncheck: instance.objects.confusioncheck.el.getVal(),
                roctable: instance.objects.roctable.el.getVal(),
                levelOfInterest: instance.objects.levelOfInterest.el.getVal()
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
module.exports.item = new Scoring().render()