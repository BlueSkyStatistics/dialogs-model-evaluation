


class scoringSurvivalML extends baseModal {
    static dialogId = 'scoringSurvivalML'
    static t = baseModal.makeT(scoringSurvivalML.dialogId)

    constructor() {
        var config = {
            id: scoringSurvivalML.dialogId,
            label: scoringSurvivalML.t('title'),
            modalType: "one",
            RCode: `
local(
{
#Run predict
BSkyPredictions <- BSkyPredict(modelname='{{selected.modelSelection | safe}}', prefix='{{selected.colname | safe}}', datasetname='{{dataset.name}}')
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
    results <- BSkyConfusionMatrixTrain(predictions=BSkyPredictions[[1]],reference =BSkyPredictions[[3]], levelOfInterest = "1")
}
else
{
#Creates the confusion matrix for models created by the specific modeling algorithm
results <- BSkyConfusionMatrix(modelname='{{selected.modelSelection | safe}}', showConfusionMatrix={{selected.confusioncheck | safe}}, predictions=BSkyPredictions[[1]] ,levelOfInterest = "1", datasetname='{{dataset.name}}')
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
                modelSelection: "BSkyGetAvailableModels(objclasslist ='coxph')",
            })
        }
        var objects = {
            /* filterModels: {
                el: new selectVar(config, {
                    no: 'filterModels',
                    label: scoringSurvivalML.t('filterModels'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["coxph"],
                    default: "coxph",
                    onselect_r: { modelSelection: "BSkyGetAvailableModelsCP( objclasslist = c('{{value}}'))" }
                })
            }, */
            modelSelection: {
                el: new selectVar(config, {
                    no: 'modelSelection',
                    label: scoringSurvivalML.t('modelSelection'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: "",
                    required: true,
                    onselect_r: { label12: "predictPrerequisiteCP('{{value}}', '{{dataset.name}}')"  }
                })
            },
            label12: { el: new preVar(config, { no: "label12", label: scoringSurvivalML.t('label12'), h: 6 }) },
            label1: { el: new labelVar(config, { label: scoringSurvivalML.t('label1'), no: "label1", h: 8, style: "mt-3" }) },
            label2: { el: new labelVar(config, { label: scoringSurvivalML.t('label2'), h: 8, style: "mt-3" }) },
            label3: { el: new labelVar(config, { label: scoringSurvivalML.t('label3'), h: 6 }) },
            colname: {
                el: new input(config, {
                    no: 'colname',
                    label: scoringSurvivalML.t('colname'),
                    placeholder: "",
                    extraction: "TextAsIs",
                    type: "character",
                    required: true,
                    value: ""
                })
            },
            conflevel: {
                el: new checkbox(config, {
                    label: scoringSurvivalML.t('conflevel'),
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
                    label: scoringSurvivalML.t('level'),
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
                    label: scoringSurvivalML.t('confusioncheck'),
                    no: "confusioncheck",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            label4: { el: new labelVar(config, { label: scoringSurvivalML.t('label4'), h: 8, style: "ml-2" }) },
            levelOfInterest: {
                el: new comboBox(config, {
                    no: 'levelOfInterest',
                    label: scoringSurvivalML.t('levelOfInterest'),
                    multiple: false,
                    style: "mt-1  ml-4 mb-3",
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            }, 
            roctable: {
                el: new checkbox(config, {
                    label: scoringSurvivalML.t('roctable'),
                    no: "roctable",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    newline: true,
                    false_value: "FALSE",
                })
            },
            label5: { el: new labelVar(config, { label: scoringSurvivalML.t('label5'), h: 8, style: "mt-1,ml-2" }) },
        }
        const content = {
           // items: [objects.filterModels.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.colname.el.content ],
           //items: [ objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.colname.el.content ],
           items: [ objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.colname.el.content, objects.confusioncheck.el.content, objects.roctable.el.content, objects.label5.el.content ],
            nav: {
                name: scoringSurvivalML.t('navigation'),
                icon: "icon-y-hat",
                onclick: `r_before_modal("${config.id}")`,
                modal_id: config.id
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: scoringSurvivalML.t('help.title'),
            r_help: "help(data,package='utils')",
            body: scoringSurvivalML.t('help.body')
        }
;
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

module.exports = {
    render: () => new scoringSurvivalML().render()
}
