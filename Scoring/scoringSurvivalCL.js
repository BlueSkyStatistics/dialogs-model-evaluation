


class scoringSurvivalCL extends baseModal {
    static dialogId = 'scoringSurvivalCL'
    static t = baseModal.makeT(scoringSurvivalCL.dialogId)

    constructor() {
        var config = {
            id: scoringSurvivalCL.dialogId,
            label: scoringSurvivalCL.t('title'),
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
                modelSelection: "BSkyGetAvailableModels(objclasslist ='coxph')",
            })
        }
        var objects = {
            /* filterModels: {
                el: new selectVar(config, {
                    no: 'filterModels',
                    label: scoringSurvivalCL.t('filterModels'),
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
					label: scoringSurvivalCL.t('label100'), 
					h:6
				})
			},
            modelSelection: {
                el: new selectVar(config, {
                    no: 'modelSelection',
                    label: scoringSurvivalCL.t('modelSelection'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: "",
                    required: true,
                    onselect_r: { label12: "predictPrerequisiteCP('{{value}}', '{{dataset.name}}',BSkySurvival = TRUE, BSkySurvivalType =\"CL\")"  }
                })
            },
            label12: { el: new preVar(config, { no: "label12", label: scoringSurvivalCL.t('label12'), h: 6 }) },
            label1: { el: new labelVar(config, { label: scoringSurvivalCL.t('label1'), no: "label1", h: 8, style: "mt-3" }) },
            label2: { el: new labelVar(config, { label: scoringSurvivalCL.t('label2'), h: 8, style: "mt-3" }) },
            label3: { el: new labelVar(config, { label: scoringSurvivalCL.t('label3'), h: 6 }) },
            followUpTime: {
                el: new input(config, {
                    no: 'followUpTime',
                    label: scoringSurvivalCL.t('followUpTime'),
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
                    label: scoringSurvivalCL.t('colname'),
                    placeholder: "",
                    extraction: "TextAsIs",
                    type: "character",
                    required: true,
                    value: ""
                })
            },
           
            conflevel: {
                el: new checkbox(config, {
                    label: scoringSurvivalCL.t('conflevel'),
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
                    label: scoringSurvivalCL.t('level'),
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
                    label: scoringSurvivalCL.t('confusioncheck'),
                    no: "confusioncheck",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            label4: { el: new labelVar(config, { label: scoringSurvivalCL.t('label4'), h: 8, style: "ml-2" }) },
            levelOfInterest: {
                el: new comboBox(config, {
                    no: 'levelOfInterest',
                    label: scoringSurvivalCL.t('levelOfInterest'),
                    multiple: false,
                    style: "mt-1  ml-4 mb-3",
                    extraction: "NoPrefix|UseComma",
                    options: [],
                    default: ""
                })
            }, 
            roctable: {
                el: new checkbox(config, {
                    label: scoringSurvivalCL.t('roctable'),
                    no: "roctable",
                    bs_type: "valuebox",
                    extraction: "TextAsIs",
                    true_value: "TRUE",
                    newline: true,
                    false_value: "FALSE",
                })
            },

            label5: { el: new labelVar(config, { label: scoringSurvivalCL.t('label5'), h: 8, style: "mt-1,ml-2" }) },
        }
        const content = {
          // items: [ objects.label100.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content, objects.label2.el.content, objects.label3.el.content, objects.followUpTime.el.content, objects.colname.el.content, objects.confusioncheck.el.content, objects.roctable.el.content, objects.label5.el.content ],
          items: [ objects.label100.el.content, objects.modelSelection.el.content, objects.label1.el.content, objects.label12.el.content,  objects.followUpTime.el.content, objects.label2.el.content, objects.label3.el.content,  objects.colname.el.content  ],
            nav: {
                name: scoringSurvivalCL.t('navigation'),
                icon: "icon-y-hat",
                onclick: `r_before_modal("${config.id}")`,
                modal_id: config.id
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: scoringSurvivalCL.t('help.title'),
            r_help: "help(data,package='utils')",
            body: scoringSurvivalCL.t('help.body')
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
                followUpTime: instance.objects.followUpTime.el.getVal(),
               // confusioncheck: instance.objects.confusioncheck.el.getVal(),
               // roctable: instance.objects.roctable.el.getVal(),
               // levelOfInterest: instance.objects.levelOfInterest.el.getVal()
            }
        }
        if (code_vars.selected.label12.substr(0, 7) != "SUCCESS") {
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

module.exports = {
    render: () => new scoringSurvivalCL().render()
}
