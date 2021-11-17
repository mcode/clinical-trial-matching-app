
/**
 * Any combination of upper or lower case ASCII letters ('A'..'Z', and
 * 'a'..'z', numerals ('0'..'9'), '-' and '.', with a length limit of 64
 * characters. (This might be an integer, an un-prefixed OID, UUID or any
 * other identifier pattern that meets these constraints.)
 * Regex: `[A-Za-z0-9\-\.]{1,64}`
 */
export type id = string;

/**
 * A Uniform Resource Identifier Reference (RFC 3986 ). Note: URIs are case
 * sensitive. For UUID (urn:uuid:53fefa32-fcbb-4ff8-8a92-55ee120877b7) use
 * all lowercase. URIs can be absolute or relative, and may have an optional
 * fragment identifier.
 */
export type uri = string;

/**
 * Indicates that the value is taken from a set of controlled strings
 * defined elsewhere. Technically,  a code is restricted to a string which
 * has at least one character and no leading or trailing whitespace, and
 * where there is no whitespace other than single spaces in the contents
 * Regex: [^\s]+([\s]?[^\s]+)*
 */
export type code = string;

/**
 * An instant in time - known at least to the second and always includes a
 * time zone. Note: This is intended for precisely observed times (typically
 * system logs etc.), and not human-reported times - for them, use date and
 * dateTime. instant is a more constrained dateTime.
 *
 * Patterns:
 * - `YYYY-MM-DDTHH:mm:ss.SSSSZ`
 * - `YYYY-MM-DDTHH:mm:ss.SSSZ`
 * - `YYYY-MM-DDTHH:mm:ssZ`
 */
export type instant = string;  // "2018-04-30T13:31:44.140-04:00"

/**
 * A date, date-time or partial date (e.g. just year or year + month) as
 * used in human communication. If hours and minutes are specified, a time
 * zone SHALL be populated. Seconds must be provided due to schema type
 * constraints but may be zero-filled and may be ignored. Dates SHALL be
 * valid dates. The time "24:00" is not allowed.
 *
 * Patterns:
 * - `YYYY-MM-DDTHH:mm:ss.SSSSZ`
 * - `YYYY-MM-DDTHH:mm:ss.SSSZ`
 * - `YYYY-MM-DDTHH:mm:ssZ`
 * - `YYYY-MM-DD`
 * - `YYYY-MM`
 * - `YYYY`
 *
 * Regex:
 * -?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01]
 * [0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]+)?(Z|(\+|-)((0[0-9]|1[0-3]):
 * [0-5][0-9]|14:00)))?)?)?
 */
export type dateTime = string;

/**
 * Any non-negative integer (e.g. >= 0)
 * Regex: [0]|([1-9][0-9]*)
 */
export type unsignedInt = number;

export type valueX = "valueInteger" | "valueUnsignedInt" | "valuePositiveInt" |
    "valueDecimal"|"valueDateTime"|"valueDate"|"valueTime"|"valueInstant"|
    "valueString"|"valueUri"|"valueOid"|"valueUuid"|"valueId"|
    "valueBoolean"|"valueCode"|"valueMarkdown"|"valueBase64Binary"|
    "valueCoding"|"valueCodeableConcept"|"valueAttachment"|
    "valueIdentifier"|"valueQuantity"|"valueSampledData"|"valueRange"|
    "valuePeriod"|"valueRatio"|"valueHumanName"|"valueAddress"|
    "valueContactPoint"|"valueTiming"|"valueReference"|"valueAnnotation"|
    "valueSignature"|"valueMeta";

export interface Element {
    id?: id;
    extension?: Array<Extension<valueX>>;
}

export interface Extension<T = "valueX"> extends Element {
    /**
     * identifies the meaning of the extension
     */
    url: uri;

    [T: string]: any;
}

export interface CapabilityStatement {
    resourceType: string;
    fhirVersion: string;
    rest: Array<{
        security?: {
            cors?: boolean;
            extension?: Array<{
                url: string;
                extension: Array<Extension<"valueUri">>
            }>
        };
        resource: Array<{
            type: string
        }>
    }>;
}

export interface Resource extends Record<string, any> {
    /**
     * Logical id of this artifact
     */
    id ?: id;

    resourceType?: string;

    /**
     * Metadata about the resource
     */
    meta ?: Meta;

    /**
     * A set of rules under which this content was created
     */
    implicitRules ?: uri;

    /**
     * Language of the resource content
     */
    language ?: code;
}

export interface Meta extends Element {

    /**
     * When the resource version last changed
     */
    lastUpdated: instant;
}

export interface Observation extends Resource {
    resourceType: "Observation";
}

export interface Patient extends Resource {
    resourceType: "Patient";
}

export interface Practitioner extends Resource {
    resourceType: "Practitioner";
}

export interface RelatedPerson extends Resource {
    resourceType: "RelatedPerson";
}

export interface Encounter extends Resource {
    resourceType: "Encounter";
}

export interface Period extends Element {
    /**
     * Starting time with inclusive boundary
     */
    start ?: dateTime;

    /**
     * End time with inclusive boundary, if not ongoing
     */
    end ?: dateTime;
}

export interface BackboneElement extends Element {
    modifierExtension ?: Extension[];
}

export interface CodeableConcept extends Element {
    /**
     * Code defined by a terminology system
     */
    coding?: Coding[];

    /**
     * Plain text representation of the concept
     */
    text?: string;
}

export interface Coding extends Element {
    /**
     * Identity of the terminology system
     */
    system ?: uri;

    /**
     * Version of the system - if relevant
     */
    version ?: string;

    /**
     * Symbol in syntax defined by the system
     */
    code ?: code;

    /**
     * Representation defined by the system
     */
    display ?: string;

    /**
     * If this coding was chosen directly by the user
     */
    userSelected ?: boolean;
}

export interface Identifier extends Element {
    use ?: "usual" | "official" | "temp" | "secondary";
    /**
     * Description of identifier
     */
    type ?: CodeableConcept;

    /**
     * The namespace for the identifier value
     */
    system ?: uri;

    /**
     * The value that is unique
     */
    value ?: string;

    /**
     * Time period when id is/was valid for use
     */
    period ?: Period;

    /**
     * Organization that issued id (may be just text)
     */
    assigner ?: Reference;
}

export interface Reference extends Element {

    /**
     * Literal reference, Relative, internal or absolute URL
     */
    reference ?: string;

    /**
     * Logical reference, when literal reference is not known
     */
    identifier ?: Identifier;

    /**
     * Text alternative for the resource
     */
    display ?: string;
}

export interface BundleLink extends BackboneElement {
    relation: string;
    url: uri;
}

export interface BundleEntry extends BackboneElement {
    fullUrl?: string; // This is optional on POSTs
    resource: Resource;
}

export interface Bundle extends Resource {
    /**
     * Persistent identifier for the bundle
     */
    identifier ?: Identifier;

    type: "document" | "message" | "transaction" | "transaction-response"
        | "batch" | "batch-response" | "history" | "searchset" | "collection";

    total ?: unsignedInt;

    link?: BundleLink[];
    entry?: BundleEntry[];
}