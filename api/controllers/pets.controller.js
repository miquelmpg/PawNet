import Pet from "../models/pet.model.js";
import createHttpError from "http-errors";

export async function create(req, res) {
    req.body.owner = req.session.user.id;
    const pet = await Pet.create(req.body);

    res.status(201).json(pet);
}

export async function remove(req, res) {
    const pet = await Pet.findById(req.params.id);

    if(!pet) {
        throw createHttpError(404, 'Pet not found');
    }

    if (pet.owner.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your pet!");
    }

    await Pet.findByIdAndDelete(pet.id);

    res.status(204).end();
}

export async function update(req, res) {
    const pet = await Pet.findById(req.params.id);

    if(!pet) {
        throw createHttpError(404, 'Pet not found');
    }

    if (pet.owner.toString() !== req.session.user.id.toString()) {
        throw createHttpError(403, "It is not your pet!");
    }

    Object.assign(pet, req.body);

    if (req.file) {
        pet.profilePicture = req.file.path;
    }

    await pet.save();
    res.json(pet);
}