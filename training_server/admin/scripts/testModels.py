from pathlib import Path
import itertools
from src import utils, BaseModel, Block
from typing import List, Dict, Any, Optional
import os
import json

class Diagram(BaseModel):
    blocks: List[Block]
    execution: str
    dataset: str
    optimizer: str
    loss_fn: str
    evalFns: List[str]
    lr: float
    epochs: int

# TO RUN, run python3 -m admin.scripts.testModels from the training_server directory

learning_rates = [0.001]
epochs = [20]
batch_sizes = [2]

optimizers = ["sgd_algorithm", "momentum_algorithm"]
loss_functions = ['cross_entropy_loss']
activation_functions = ['relu_activation', 'sigmoid_activation', 'tanh_activation', 'softmax_activation']
layers = [0, 1, 2, 3]

combinations = list(itertools.product(learning_rates, epochs, batch_sizes, optimizers, loss_functions, activation_functions, layers))

final_results = []

# j = 0

for combo in combinations:
    # j += 1
    # if j >= 3:
    #     break
    learning_rate, epoch, batch_size, optimizer, loss_fn, activation_fn, layer = combo

    # DIAGRAM
    # blocks: List[Block]
    # execution: str
    # dataset: str
    # optimizer: str
    # loss_fn: str
    # evalFns: List[str]
    # lr: float
    # epochs: int

    blocks = []
    counter = 1
    for i in range(layer):
        blocks.append({
            "block_id": "linear_layer",
            "order": counter,
            "params": {
                "out_features": 64
            }
        })
        counter += 1
        blocks.append({
            "block_id": activation_fn,
            "order": counter,
            "params": {}
        })
        counter += 1
    
    if (loss_fn == 'cross_entropy_loss'):
        blocks.append({
            "block_id": "linear_layer",
            "order": counter,
            "params": {
                "out_features": 1
            }
        })
        counter += 1
        # blocks.append({
        #     "block_id": "sigmoid_activation",
        #     "order": counter,
        #     "params": {}
        # })
        # counter += 1
    else:
        blocks.append({
            "block_id": "linear_layer",
            "order": counter,
            "params": {
                "out_features": 1
            }
        })
        counter += 1
        blocks.append({
            "block_id": activation_fn,
            "order": counter,
            "params": {}
        })
        counter += 1

    diagram = Diagram(
        blocks=blocks,
        execution="train",
        dataset= "weather",
        optimizer= optimizer,
        loss_fn= loss_fn,
        evalFns = ['accuracy_metric', 'precision_metric', 'recall_metric', 'f1_score_metric'],
        lr= learning_rate,
        epochs= epoch,
    )
    

    dataloader_creator = utils.DataLoaderCreator(
        'weather',
        Path("/Users/lukemoberly/Desktop/win25-Team8/training_server/admin/datasets"),
        loss_fn
    )   
    train_loader, test_loader, input_shape, output_shape, type = dataloader_creator.getLoaders()
    executable_model = utils.Diagram(
        train_loader,
        test_loader,
        input_shape,
        output_shape,
        "",
        "",
        ""
    )


    executable_model.digest_diagram_object(diagram)
    executable_model.create_model_from_inputs()

    result = executable_model.execute()
    final_results.append({
        "diagram": {
            "blocks": blocks,
            "execution": "train",
            "dataset": "weather",
            "optimizer": optimizer,
            "loss_fn": loss_fn,
            "evalFns": ['accuracy_metric', 'precision_metric', 'recall_metric', 'f1_score_metric'],
            "lr": learning_rate,
            "epochs": epoch
        },
        "result": result
    })
    print(result)

# save final results to output.json
with open('./admin/scripts/output.json', 'w') as f:
    f.write(json.dumps(final_results))



# dataloader_creator = utils.DataLoaderCreator(
#         'mushrooms',
#         Path("/admin/datasets"),
#         diagram.loss_fn
#     )

#     logger.info(f"Retrieving dataset: {dataset}")

#     # Get train and test loaders
#     train_loader, test_loader, input_shape, output_shape = dataloader_creator.getLoaders()
    
#     # Create the model and execute it
#     executable_model = utils.Diagram(
#         train_loader,
#         test_loader,
#         input_shape,
#         output_shape,
#         job_id,
#         callback_url,
#         user_id
#     )
    
#     executable_model.digest_diagram_object(diagram)
#     executable_model.create_model_from_inputs()

#     logger.info('Executing model')

#     executable_model.execute()

#     logger.info(f"Model execution complete for diagram: {diagram}")