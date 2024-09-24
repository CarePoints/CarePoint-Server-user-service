// export function extractMedicationNames(text: string): string[] {
//     const medicationSection = text.split("Prescribed Medications:")[1];

//     if (!medicationSection) return [];

//     const lines = medicationSection.split('\n');
//     const medications: string[] = [];

//     for (const line of lines) {
//         const trimmedLine = line.trim();

//         if (trimmedLine.startsWith("Additional Notes:") || trimmedLine.startsWith("This prescription") || trimmedLine.startsWith("For any queries")) {
//             break;
//         }

//         if (trimmedLine && !trimmedLine.startsWith("Dosage:") && !trimmedLine.startsWith("Frequency:") && !trimmedLine.startsWith("Duration:")) {
//             medications.push(trimmedLine);
//         }
//     }

//     return medications;
// }


export function extractPrescriptionData(text: string): { patientName: string; patientEmail: string; medications: string[] } {
    const patientNameMatch = text.match(/Name:\s*(.*)/);
    const patientEmailMatch = text.match(/Email:\s*(.*)/);
    const medicationSection = text.split("Prescribed Medications:")[1];

    if (!medicationSection) return { patientName: '', patientEmail: '', medications: [] };

    const lines = medicationSection.split('\n');
    const medications: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith("Additional Notes:") || trimmedLine.startsWith("This prescription") || trimmedLine.startsWith("For any queries")) {
            break;
        }

        if (trimmedLine && !trimmedLine.startsWith("Dosage:") && !trimmedLine.startsWith("Frequency:") && !trimmedLine.startsWith("Duration:")) {
            medications.push(trimmedLine);
        }
    }

    return {
        patientName: patientNameMatch ? patientNameMatch[1].trim() : '',
        patientEmail: patientEmailMatch ? patientEmailMatch[1].trim() : '',
        medications
    };
}