/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


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
        conflevel: "Save confidence and predicton intervals for individual predicted values  **(Valid only for linear models (class lm))",
        rocCurves: "Show ROC curves (**For binary dependent variables only)",
        roctable: "Show ROC table (**For binary dependent variables only)",
        saveRoctableToDataset: "Save ROC table to a dataset(**For binary dependent variables only)",
        label6: "**Checking the checkbox above will incur a performance penalty for large datasets.",
        colname: "Specify column name prefix",
        datasetNameForROC: "Enter a dataset name to store the values in the ROC table.",
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
    <b>Zero-Inflated / Hurdle models (class "zeroinfl"/"hurdle", package pscl)</b></br>
    These models have two linear predictors and are scored differently from other model classes: instead of a single predicted value, three columns are added with the specified prefix:</br>
    <ul>
    <li>
    <code>{prefix}_ExpectedCount</code>: the overall expected count E[Y|X], blending both parts of the model. Comparable to a plain Poisson/Negative Binomial prediction.
    </li>
    <li>
    <code>{prefix}_StructuralZeroProb</code> (Zero-Inflated models only): the probability this row is a "structural zero" - genuinely not at risk this period.
    </li>
    <li>
    <code>{prefix}_ProbNoEvent</code> (Hurdle models only): the probability of zero events at all, P(Y=0) - the hurdle-crossing probability.
    </li>
    <li>
    <code>{prefix}_ExpectedCountIfAtRisk</code>: the expected count given the row is at risk / the hurdle is crossed - useful for severity estimation once an event is known or assumed to occur.
    </li>
    </ul>
    Confidence/prediction intervals, ROC curves, ROC tables, and the confusion matrix are not applicable to these model classes and are skipped automatically.
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
#Zero-Inflated/Hurdle models (package pscl, class "zeroinfl"/"hurdle") have two linear predictors and
#were not built into BSkyPredict() (which targets single-formula models), nor into predictPrerequisiteCP()
#(the pre-check run when a model is selected). Rather than depend on either hidden function, this path is
#fully self-contained: class detection, predictor-variable handling, and prediction are all done here with
#base R + tryCatch, and execution is never gated on predictPrerequisiteCP()'s result for these two classes
#(see prepareExecution() in this dialog's JS and the modelSelection onselect_r hook).
BSky_Model_Obj = tryCatch(get('{{selected.modelSelection | safe}}'), error = function(e) NULL)
if (is.null(BSky_Model_Obj))
{
cat("ERROR: The model '{{selected.modelSelection | safe}}' could not be found. Please rebuild or reselect the model.\\n")
}
else if (inherits(BSky_Model_Obj, "zeroinfl") || inherits(BSky_Model_Obj, "hurdle"))
{
tryCatch(
{
BSky_ZI_NewData = get('{{dataset.name}}')
BSky_ZI_Prefix = '{{selected.colname | safe}}'

#Overall expected count E[Y|X] - the single best point estimate, blending both parts of the model.
#Comparable to what a plain Poisson/Negative Binomial model's prediction gives you.
BSky_ZI_ExpCount = predict(BSky_Model_Obj, newdata = BSky_ZI_NewData, type = "response")
eval(parse(text = paste("{{dataset.name}}", "$", BSky_ZI_Prefix, "_ExpectedCount", "<<-", "BSky_ZI_ExpCount", sep = "")))

if (inherits(BSky_Model_Obj, "zeroinfl"))
{
#Probability this row is a "structural zero" - genuinely not at risk this period (Zero-Inflated models only).
BSky_ZI_ZeroProb = predict(BSky_Model_Obj, newdata = BSky_ZI_NewData, type = "zero")
eval(parse(text = paste("{{dataset.name}}", "$", BSky_ZI_Prefix, "_StructuralZeroProb", "<<-", "BSky_ZI_ZeroProb", sep = "")))
}
else
{
#Probability of zero events at all (P(Y=0)) - the hurdle-crossing probability (Hurdle models only).
BSky_ZI_ZeroProb = predict(BSky_Model_Obj, newdata = BSky_ZI_NewData, type = "prob")[, 1]
eval(parse(text = paste("{{dataset.name}}", "$", BSky_ZI_Prefix, "_ProbNoEvent", "<<-", "BSky_ZI_ZeroProb", sep = "")))
}

#Expected count given the row is at risk / the hurdle is crossed - useful for severity estimation
#once you already know (or assume) an event occurs.
#IMPORTANT: for Hurdle models, predict(..., type="count") returns the RAW (untruncated) rate
#parameter feeding the count part, not the true conditional mean E[Y | Y>0] - because the count part
#of a Hurdle model is zero-truncated by construction (it can never itself produce a zero; zero is
#handled entirely by the hurdle part). The true E[Y|Y>0] is always somewhat higher than the raw rate.
#For Zero-Inflated models no such adjustment applies: the count part is a normal, non-truncated
#Poisson/Negative Binomial that is allowed to produce zeros naturally, so the raw predicted value
#already is the correct "expected count if this row is not a structural zero".
BSky_ZI_CondCount = predict(BSky_Model_Obj, newdata = BSky_ZI_NewData, type = "count")
if (inherits(BSky_Model_Obj, "hurdle"))
{
#Wrapped in its own tryCatch: if $dist/$theta are not the single scalar values assumed here (e.g. a
#future pscl version stores hurdle's count/zero distributions differently), this falls back to the
#unadjusted rate with a note, rather than failing the whole scoring run.
BSky_ZI_CondCount = tryCatch(
{
#[1] defensively forces a single scalar even if $dist/$theta were ever length > 1 for this class.
BSky_ZI_Dist = BSky_Model_Obj\$dist[1]
if (identical(BSky_ZI_Dist, "negbin"))
{
BSky_ZI_Theta = BSky_Model_Obj\$theta[1]
BSky_ZI_P0 = stats::dnbinom(0, size = BSky_ZI_Theta, mu = BSky_ZI_CondCount)
}
else
{
BSky_ZI_P0 = stats::dpois(0, BSky_ZI_CondCount)
}
#General relationship: for any distribution, E[Y] = E[Y|Y>0]*P(Y>0), so E[Y|Y>0] = mu / (1 - P(Y=0)),
#where mu here is the untruncated rate parameter and P(Y=0) is computed from that same untruncated
#distribution (never observed directly, since Hurdle's count part is fit only on the positive values).
BSky_ZI_CondCount / (1 - BSky_ZI_P0)
}, error = function(e)
{
cat("Note: Could not apply the zero-truncation adjustment to the at-risk expected count (", conditionMessage(e), "). Reporting the unadjusted rate instead.\\n", sep = "")
BSky_ZI_CondCount
})
}
eval(parse(text = paste("{{dataset.name}}", "$", BSky_ZI_Prefix, "_ExpectedCountIfAtRisk", "<<-", "BSky_ZI_CondCount", sep = "")))

cat("Scoring complete. Columns added with prefix '", BSky_ZI_Prefix, "':\\n", sep = "")
cat(" - ", BSky_ZI_Prefix, "_ExpectedCount : overall expected count E[Y|X]\\n", sep = "")
if (inherits(BSky_Model_Obj, "zeroinfl"))
{
cat(" - ", BSky_ZI_Prefix, "_StructuralZeroProb : probability this row is a structural zero (not at risk this period)\\n", sep = "")
}
else
{
cat(" - ", BSky_ZI_Prefix, "_ProbNoEvent : probability of zero events (P(Y=0))\\n", sep = "")
}
cat(" - ", BSky_ZI_Prefix, "_ExpectedCountIfAtRisk : expected count given the row is at risk / the hurdle is crossed", if (inherits(BSky_Model_Obj, "hurdle")) " (already adjusted for zero-truncation)" else "", "\\n", sep = "")
cat("\\nNote: Confidence/prediction intervals, ROC curves, ROC tables, and the confusion matrix do not apply to Zero-Inflated/Hurdle count models and were skipped.\\n")
}, error = function(e) { cat("ERROR scoring with this Zero-Inflated/Hurdle model:", conditionMessage(e), "\\n") })
}
else
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
if (ROC && ({{selected.roctable | safe}} || {{selected.rocCurves | safe}}) || {{selected.saveRoctableToDataset | safe}})
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
    if ({{selected.roctable | safe}} || {{selected.saveRoctableToDataset | safe}})
    {
        results <-createROCTable(predictedprobs =BSkyPredictions[[2]],dependentvariable =BSkyPredictions[[3]], modelname="{{selected.modelSelection | safe}}",datasetname ="{{dataset.name}}")
    }
    {{if (options.selected.saveRoctableToDataset == "TRUE")}}.GlobalEnv\${{selected.datasetNameForROC | safe}} = results{{/if}}
    
    if ({{selected.rocCurves | safe}})
    {
        BSkytemp = data.frame(BSkyPredictions[[2]], BSkyPredictions[[3]])
        BSkytemp = na.omit(BSkytemp)
        pr <- ROCR::prediction(BSkytemp[,1], BSkytemp[,2], label.ordering = levels(BSkyPredictions[[3]]))
        attributes(pr)$cutoffs[[1]][attributes(pr)$cutoffs[[1]]==Inf]<-1
        prf <- ROCR::performance(pr, measure = "tpr", x.measure = "fpr")
        attributes(prf)$cutoffs[[1]][attributes(prf)$cutoffs[[1]]==Inf]<-1   
        plot(prf, main = "ROC Curve")
        auc <- ROCR::performance(pr, measure = "auc")
        auc <- auc@y.values[[1]]
        auc <- base::round(auc, digits = BSkyGetDecimalDigitSetting())
        cat( paste("The area under the curve (AUC) is",auc,sep=" "))
        perf <- ROCR::performance(pr, "sens", "spec")
        plot(perf, colorize=TRUE, lwd= 3, main="... Sensitivity/Specificity plots ...")
    }
    if ({{selected.roctable | safe}})
    {
        BSkyFormat(results, singleTableOutputHeader='ROC Table')
    }
    if( exists("BSkytemp")) rm(BSkytemp)
}
}
}
)
#Refresh dataset
BSkyLoadRefresh("{{dataset.name}}")
{{if (options.selected.saveRoctableToDataset == "TRUE")}} BSkyLoadRefresh("{{selected.datasetNameForROC | safe}}"){{/if}}
`,
            pre_start_r: JSON.stringify({
                //modelSelection: "BSkyGetAvailableModels(objclasslist ='All_Models', suppress = \"coxph\")",
				modelSelection: "BSkyGetAvailableModels(c(\"lm\", \"glm\", \"gls\", \"lme\",\"loglm\", \"negbin\", \"nls\",\"survreg\",\"lmerModLmerTest\", \"polr\",\"multinom\",\"loess\",\"zeroinfl\",\"hurdle\"), returnClassTrain=FALSE)",
            })
        }
        var objects = {
            filterModels: {
                el: new selectVar(config, {
                    no: 'filterModels',
                    label: localization.en.filterModels,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["adaboost", "All_Models", "BinaryTree", "blasso", "C5.0", "drc", "earth", "gbm", "glm", "glmnet", "hurdle", "knn3", "ksvm", "lm", "lmerModLmerTest", "lognet", "mlp", "multinom", "NaiveBayes", "nls", "nn", "nnet", "polr", "randomForest", "RandomForest", "ranger", "real_adaboost", "rlm", "rpart", "rq", "rsnns", "train", "xgb.Booster", "zeroinfl"],
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
                    onselect_r: { label12: "local({m=tryCatch(get('{{value}}'),error=function(e) NULL); if(!is.null(m) && (inherits(m,'zeroinfl')||inherits(m,'hurdle'))){nv=tryCatch(all.vars(formula(m))[-1],error=function(e) character(0));ds=tryCatch(get('{{dataset.name}}'),error=function(e) NULL);if(is.null(ds)){\"ZI_INFO: Dataset '{{dataset.name}}' could not be found yet - this will be re-checked when you click Run.\"}else{mv=setdiff(nv,names(ds));if(length(mv)==0){\"ZI_INFO: All required predictor variables appear to be available in the dataset. Click Run to score.\"}else{paste(\"ZI_INFO: The following predictor variable(s) required by the model do not appear to be in the dataset:\",paste(mv,collapse=', '),\"- this will be re-checked when you click Run.\")}}}else{predictPrerequisiteCP('{{value}}', '{{dataset.name}}')}})" , levelOfInterest: "bivariateLevels(datasetName=c('{{dataset.name}}'),dependentVariable=getModelDependentVariable('{{value}}'))" }
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
            datasetNameForROC: {
                el: new input(config, {
                    no: 'datasetNameForROC',
                    label: localization.en.datasetNameForROC,
                    placeholder: "",
                    extraction: "TextAsIs",
                    type: "character",
                    style: "ml-4",
                    width: "w-50",
                    overwrite: "dataset",
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
                    step: 0.0001,
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

            rocCurves: {
                el: new checkbox(config, {
                    label: localization.en.rocCurves,
                    no: "rocCurves",
                    newline: true,
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            roctable: {
                el: new checkbox(config, {
                    label: localization.en.roctable,
                    no: "roctable",
                    newline: true,
                    bs_type: "valuebox",
                    style: "mt-2",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            
            saveRoctableToDataset: {
                el: new checkbox(config, {
                    label: localization.en.saveRoctableToDataset,
                    no: "saveRoctableToDataset",
                    required:true,
                    //extraction: "TextAsIs",
                    extraction: "Boolean",
                   // true_value: "TRUE",
                   // false_value: "FALSE",
                    dependant_objects: ["datasetNameForROC"]
                })
            },
            label5: { el: new labelVar(config, { label: localization.en.label5, h: 8, style: "mt-1,ml-2" }) },
            label6: { el: new labelVar(config, { label: localization.en.label6, h: 8, style: "mt-1,ml-2" }) },
        }
        const content = {
            items: [objects.filterModels.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.colname.el.content, objects.conflevel.el.content, objects.level.el.content, objects.confusioncheck.el.content, objects.label4.el.content, objects.levelOfInterest.el.content,objects.rocCurves.el.content,objects.roctable.el.content, objects.label5.el.content,objects.saveRoctableToDataset.el.content, objects.label6.el.content,objects.datasetNameForROC.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-y-hat",
                onclick: `r_before_modal('${config.id}')`,
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
                saveRoctableToDataset: instance.objects.saveRoctableToDataset.el.getVal()?"TRUE":"FALSE",
                rocCurves: instance.objects.rocCurves.el.getVal(),
                levelOfInterest: instance.objects.levelOfInterest.el.getVal(),
                datasetNameForROC: instance.objects.datasetNameForROC.el.getVal(),
            }
        }
        //Zero-Inflated/Hurdle models (label12 starts with "ZI_" - see the modelSelection onselect_r hook)
        //use a fully self-contained R path within the RCode itself (class detection, predictor-variable
        //validation, and prediction all handled there via base R + tryCatch). This dialog does not gate
        //execution on label12 for these two classes - label12 is shown to the user as an informative
        //pre-check only. No dependency on predictPrerequisiteCP() or BSkyPredict() for this path.
        if (code_vars.selected.label12.substr(0, 3) === "ZI_") {
            let cmd = instance.dialog.renderR(code_vars)
            cmd = removenewline(cmd);
            res.push({ cmd: cmd, cgid: newCommandGroup(`${instance.config.id}`, `${instance.config.label}`), oriR: instance.config.RCode, code_vars: code_vars })
        }
        else if (code_vars.selected.label12.substr(0, 7) != "SUCCESS") {
            let cmd = "cat(\"ERROR: The predictor variables that the model requires for scoring are not available in the dataset.\n Please review the diagnostic message on the dialog.\")";
            res.push({ cmd: cmd, cgid: newCommandGroup(`${instance.config.id}`, `${instance.config.label}`), oriR: instance.config.RCode, code_vars: code_vars })
        }
        else {
            let cmd = instance.dialog.renderR(code_vars)
            cmd = removenewline(cmd);
            res.push({ cmd: cmd, cgid: newCommandGroup(`${instance.config.id}`, `${instance.config.label}`), oriR: instance.config.RCode, code_vars: code_vars })
        }
        return res;
    }
}
module.exports.item = new Scoring().render()