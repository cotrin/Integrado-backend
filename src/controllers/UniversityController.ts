import { Request, Response } from 'express'

import type { University, UniversityResponse } from '../types/University'

import { db } from '../../prisma'


export async function getAllUniversities(req: Request, res: Response) {
    const { country, page = '1' }: { country?: string, page?: string } = req.query

    const universities = await db.university.findMany({
        select: {
            id: true,
            name: true,
            country: true,
            state_province: true
        },
        where: {
            country: {
                equals: country,
                mode: 'insensitive'
            }
        },
        take: 20,
        skip: (Number(page) - 1) * 20,
    })

    const sanitizedUniversities = universities.map(university => {
        return {
            _id: university.id,
            name: university.name,
            country: university.country,
            'state-province': university.state_province
        }
    })


    const response = {
        page: Number(page),
        universities: sanitizedUniversities,
        amount: universities.length
    }

    res.json(response)
}

export async function getUniversityById(req: Request, res: Response) {
    const { id } = req.params

    const university = await db.university.findUnique({
        where: {
            id
        }
    })

    if (!university) {
        return res.status(404).json({
            error: "University Not Found"
        })
    }

    const sanitizedUniversity: UniversityResponse = {
        _id: university.id,
        name: university.name,
        country: university.country,
        'state-province': university.state_province,
        alpha_two_code: university.alpha_two_code,
        domains: university.domains,
        web_pages: university.web_pages
    }

    res.json(sanitizedUniversity)
}

export async function addUniversity(req: Request, res: Response) {
    const { alpha_two_code, web_pages, name, country, domains, state_province } = req.body

    // Validations
    if (!alpha_two_code || !web_pages || !name || !country || !domains) {
        return res.status(400).json({
            error: 'Missing required information',
            alpha_two_code: alpha_two_code ?? null,
            web_pages: web_pages ?? null,
            name: name ?? null,
            country: country ?? null,
            domains: domains ?? null,
        })
    }

    if (alpha_two_code.length !== 2) {
        return res.status(400).json({ error: 'Country abbreviation needs to be 2 characters long' })
    }

    const alreadyExists = await db.university.findFirst({
        where: {
            country,
            state_province,
            name,
        }
    })

    if (alreadyExists) {
        return res.status(400).json({ error: 'University already exists' })
    }

    const university: University = {
        alpha_two_code,
        web_pages,
        name,
        country,
        domains,
        state_province
    }

    const newUniversity = await db.university.create({
        data: university
    })

    const sanitizedUniversity: UniversityResponse = {
        _id: newUniversity.id,
        name: newUniversity.name,
        country: newUniversity.country,
        'state-province': newUniversity.state_province,
        alpha_two_code: newUniversity.alpha_two_code,
        domains: newUniversity.domains,
        web_pages: newUniversity.web_pages
    }

    res.status(201).json({
        message: 'Created University',
        newUniversity: sanitizedUniversity
    })
}

export async function updateUniversity(req: Request, res: Response) {
    const { id } = req.params
    const { web_pages, name, domains } = req.body

    try {
        const updatedUniversity = await db.university.update({
            where: {
                id
            },
            data: {
                web_pages,
                name,
                domains
            }
        })

        const sanitizedUniversity: UniversityResponse = {
            _id: updatedUniversity.id,
            name: updatedUniversity.name,
            country: updatedUniversity.country,
            'state-province': updatedUniversity.state_province,
            alpha_two_code: updatedUniversity.alpha_two_code,
            domains: updatedUniversity.domains,
            web_pages: updatedUniversity.web_pages
        }

        return res.status(200).json({
            message: 'Updated University',
            updatedUniversity: sanitizedUniversity
        })

    } catch (error) {
        return res.status(404).json({
            error: 'University Not Found'
        })
    }

}

export async function deleteUniversity(req: Request, res: Response) {
    const { id } = req.params


    const deletedUniversity = await db.university.delete({
        where: {
            id
        }
    })

    const sanitizedUniversity: UniversityResponse = {
        _id: deletedUniversity.id,
        name: deletedUniversity.name,
        country: deletedUniversity.country,
        'state-province': deletedUniversity.state_province,
        alpha_two_code: deletedUniversity.alpha_two_code,
        domains: deletedUniversity.domains,
        web_pages: deletedUniversity.web_pages
    }

    return res.status(200).json({ message: 'Deleted University', deletedUniversity: sanitizedUniversity })
}