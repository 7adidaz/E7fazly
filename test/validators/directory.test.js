import Joi from 'joi';
import {
    createDirectoryDataValidator,
    parentIdValidator,
    userIdValidator,
    updateDirectoryDataValidator,
    deleteDirectoryDataValidator,
} from '../../validators/directory.js';
import { objectValidator, singleValidator } from '../../validators/basic_validators.js';
import { ValidationError } from '../../util/error.js';

describe('createDirectoryDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { name: 'Test Directory', parentId: 1} };
        const reply = {};
        const next = jest.fn();

        const value = { name: 'Test Directory', parentId: 1 };
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        createDirectoryDataValidator(req, reply, next);

        expect(req.body.value).toEqual(value);
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { name: 'Test Directory', ownerId: 1 } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        createDirectoryDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('parentIdValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { params: { parentId: 1 } };
        const reply = {};
        const next = jest.fn();

        const value = 1;
        jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        parentIdValidator(req, reply, next);

        expect(req.body.value).toEqual({ parentId: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { params: {} };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        parentIdValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('updateDirectoryDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { body: { changes: [{ id: 1, icon: 'test', name: 'Test Directory', parentId: 1 }] } };
        const reply = {};
        const next = jest.fn();

        const value = [{ id: 1, icon: 'test', name: 'Test Directory', parentId: 1 }];
        jest.spyOn(objectValidator, 'call').mockReturnValue(value);

        updateDirectoryDataValidator(req, reply, next);

        expect(req.body.value).toEqual({ changes: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { body: { changes: [{ id: '1', name: 'Test Directory', parentId: 1 }] } };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(objectValidator, 'call').mockImplementation(() => {
            throw error;
        });

        updateDirectoryDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});

describe('deleteDirectoryDataValidator', () => {
    it('should call next if validation succeeds', () => {
        const req = { query: { ids: '[1, 2, 3]' } };
        const reply = {};
        const next = jest.fn();

        const value = [1, 2, 3];
        // jest.spyOn(singleValidator, 'call').mockReturnValue(value);

        deleteDirectoryDataValidator(req, reply, next);

        expect(req.body.value).toEqual({ ids: value });
        expect(next).toHaveBeenCalled();
    });

    it('should call next with an error if validation fails', () => {
        const req = { query: {} };
        const reply = {};
        const next = jest.fn();

        const error = new ValidationError();
        jest.spyOn(singleValidator, 'call').mockImplementation(() => {
            throw error;
        });

        deleteDirectoryDataValidator(req, reply, next);

        expect(next).toHaveBeenCalledWith(error);
    });
});
