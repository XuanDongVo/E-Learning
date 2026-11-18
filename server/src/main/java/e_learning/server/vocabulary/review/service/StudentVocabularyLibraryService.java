package e_learning.server.vocabulary.review.service;

import e_learning.server.common.dto.PageResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibrarySummaryResponse;
import e_learning.server.vocabulary.review.dto.response.StudentVocabularyLibraryWordResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentVocabularyLibraryService {

    public PageResponse<StudentVocabularyLibrarySummaryResponse> getSummary(long userId){
        return null;
    }

    public PageResponse<List<StudentVocabularyLibraryWordResponse>> getLearned (){
        return null;
    }
    public PageResponse<List<StudentVocabularyLibraryWordResponse>> getDue (){
        return null;
    }
    public PageResponse<List<StudentVocabularyLibraryWordResponse>> getWaiting (){
        return null;
    }

}
